const { check, validationResult } = require("express-validator");
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const user = require("../models/user");

exports.getLogin = (req, res) => {
  res.render("auth/login", {
    pageTitle: "Login Page",
    currentPage: "Login",
    isLoggedIn: false,
    errors: [],
    oldInput: {email: ""},
    user: {},
  });
};

exports.postLogin = async (req, res) => {
  const {email, password} = req.body;
  const user = await User.findOne({email});
  if(!user){ // user not found
    return res.status(422).render("auth/login", {
      pageTitle: "Login Page",
      currentPage: "Login",
      isLoggedIn: false,
      errors: [{msg: "Invalid Email"}],
      oldInput: {email},
      user: {},
    });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if(!isMatch){ // password not matched
    return res.status(422).render("auth/login", {
      pageTitle: "Login Page",
      currentPage: "Login",
      isLoggedIn: false,
      errors: [{msg: "Invalid Password"}],
      oldInput: {email},
      user: {},
    });
  }


  req.session.isLoggedIn = true;
  req.session.user = user;
  await req.session.save();
  res.redirect("/");
};

exports.postLogout = (req, res) => {
  req.session.destroy((err) => {
    console.log(err);
    return res.redirect("/login");
  });
};

exports.getSignup = (req, res) => {
  res.render("auth/signup", {
    pageTitle: "Signup Page",
    currentPage: "Signup",
    isLoggedIn: false,
    errors: [],
    oldInput: {
      firstName: "",
      lastName: "",
      email: "",
      userType: "",
    },
    user: {},
  });
};

// exports.postSignup = (req, res) => {
//   console.log("signup detail given by client",req.body);
//   res.redirect("/");
// }

exports.postSignup = [
  // First Name Validation
  check("firstName")
    .notEmpty()
    .withMessage("First Name is required")
    .trim()
    .isLength({ min: 2 })
    .withMessage("First Name must be at least 2 characters long")
    .matches(/^[A-Za-z]+$/)
    .withMessage("First Name must contain only alphabetic characters"),

  // Last Name Validation
  check("lastName")
    .matches(/^[A-Za-z]+$/)
    .withMessage("Last Name must contain only alphabetic characters"),

  // Email Validation
  check("email")
    .isEmail()
    .withMessage("Please enter a valid email address")
    .normalizeEmail(),

  // Password Validation
  check("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/[a-z]/)
    .withMessage("Password must contain at least one lowercase letter")
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least one uppercase letter")
    .matches(/[0-9]/)
    .withMessage("Password must contain at least one number")
    .matches(/[@$!%*?&]/)
    .withMessage(
      "Password must contain at least one special character (@, $, !, %, *, ?, &)"
    )
    .trim(),

  // Confirm Password Validation
  check("confirmPassword")
    .trim()
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),

  // userType Validation
  check("userType")
    .notEmpty()
    .withMessage("User Type is required")
    .isIn(["guest", "host"])
    .withMessage("Invalid user type"),

  // terms and conditions Validation
  check("terms")
    .notEmpty()
    .withMessage("You must accept the terms and conditions")
    .custom((value, { req }) => {
      if (value !== "on") {
        throw new Error("You must accept the terms and conditions");
      }
      return true;
    }),

  // Final Request Handler
  (req, res, next) => {
    const { firstName, lastName, email, password, userType } = req.body;
    const errors = validationResult(req);
    console.log(errors.array());
    if (!errors.isEmpty()) {
      return res.status(422).render("auth/signup", {
        pageTitle: "Sign up",
        isLoggedIn: false,
        currentPage: "Signup",
        errors: errors.array(),
        // errorMessages: errors.array().map((err) => err.msg), alternative way to send error messages
        oldInput: { firstName, lastName, email, userType },
        user: {},
      });
    } 

    bcrypt.hash(password, 12).then(hashedPassword => {
      const user = new User({ firstName, lastName, email, password: hashedPassword, userType });
      return user.save();
    }).then(() => {
      res.redirect("/login");
    }).catch(err => {

      return res.status(422).render("auth/signup", {
        pageTitle: "Sign up",
        isLoggedIn: false,
        currentPage: "Signup",
        errors: [{ msg: err.message }],
        oldInput: { firstName, lastName, email, userType },
        user: {},
      });
    })
  }
];
