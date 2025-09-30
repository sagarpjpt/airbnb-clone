const Home = require("../models/home");
const fs = require("fs");
const path = require("path");
const rootDir = require("../utils/pathUtil");

exports.getAddHome = (req, res, next) => {
  res.render("host/edit-home", {
    pageTitle: "Add Home to airbnb",
    currentPage: "addHome",
    editing: false,
    home: null,
    isLoggedIn: req.isLoggedIn,
    user: req.session.user,
  });
};

exports.getHostHomes = (req, res, next) => {
  Home.find().then((homes) => {
    res.render("host/host-home-list", {
      registeredHomes: homes,
      pageTitle: "Host Homes List",
      currentPage: "host-homes",
      isLoggedIn: req.isLoggedIn,
      user: req.session.user,
    });
  });
};

exports.postAddHome = (req, res, next) => {
  const { houseName, price, location, rating, description } = req.body;
  console.log("added new home details: ", req.body);
  console.log("file details: ", req.file);
  if (!req.file) {
    return res.status(422).send("No Image Provided");
  }

  // const photo = req.file.path; // saving the path of uploaded file
  const photo = "/uploads/" + req.file.filename;

  const home = new Home({
    houseName,
    price,
    location,
    rating,
    photo,
    description,
  });
  home
    .save()
    .then(() => {
      console.log("home added successfully");
      res.render("host/home-added", {
        pageTitle: "Home Added Successfully",
        currentPage: "Home Added",
        isLoggedIn: req.isLoggedIn,
        user: req.session.user,
      });
    })
    .catch((err) => {
      console.log("error while posting home", err);
    });
};

exports.getEditHome = (req, res, next) => {
  const homeId = req.params.homeId; // reading path parameter
  const editing = req.query.editing === "true"; //reading query parameter & checking t or f

  Home.findById(homeId).then((home) => {
    if (!home) {
      console.log("home not found for editing");
      return res.redirect("/host/host-home-list");
    }
    console.log(homeId, editing, home);
    res.render("host/edit-home", {
      pageTitle: "Edit Your Home",
      currentPage: "host-homes",
      editing: editing,
      home: home,
      isLoggedIn: req.isLoggedIn,
      user: req.session.user,
    });
  });
};

exports.postEditHome = (req, res, next) => {
  const { id, houseName, price, location, rating, description } = req.body;
  Home.findById(id)
    .then((home) => {
      home.houseName = houseName;
      home.price = price;
      home.location = location;
      home.rating = rating;
      // home.photo = photo;
      home.description = description;
      if (req.file) {
        const oldPhotoPath = path.join(rootDir, "public", home.photo);

        fs.unlink(oldPhotoPath, (err) => {
          if (err) console.log("error while deleting file", err);
          else console.log("previous file deleted");
        });

        home.photo = "/uploads/" + req.file.filename;
      }

      home
        .save()
        .then((result) => {
          console.log("UPDATED HOME!", result);
        })
        .catch((err) => {
          console.log(err);
        });
      res.redirect("/host/host-home-list");
    })
    .catch((err) => {
      console.log("error while editing home", err);
    });
};

exports.postDeleteHome = (req, res, next) => {
  const homeId = req.params.homeId;
  console.log("came to delete :", homeId);
  Home.findByIdAndDelete(homeId)
    .then(() => {
      res.redirect("/host/host-home-list");
    })
    .catch((err) => {
      console.log("error while deleting file", err);
    });
};
