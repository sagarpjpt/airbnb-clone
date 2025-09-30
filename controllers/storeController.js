// Cancel (delete) a booking for the current user
exports.postDeleteBooking = async (req, res, next) => {
  if (!req.session.isLoggedIn) {
    return res.redirect("/login");
  }
  const bookingId = req.params.bookingId;
  try {
    // Only allow user to delete their own booking
    await Booking.deleteOne({ _id: bookingId, userId: req.session.user._id });
    res.redirect("/bookings");
  } catch (error) {
    console.error("Error deleting booking:", error);
    res.redirect("/bookings");
  }
};
const Home = require("../models/home");
const User = require("../models/user");

const path = require("path");
const rootDir = require("../utils/pathUtil");

exports.getIndex = (req, res, next) => {
  console.log(req.session, req.session.isLoggedIn);
  Home.find()
    .then((homes) => {
      res.render("store/index", {
        registeredHomes: homes,
        pageTitle: "airbnb Home",
        currentPage: "index",
        isLoggedIn: req.isLoggedIn,
        user: req.session.user,
      });
    })
    .catch((err) => console.log("error", err));
};

exports.getHomes = (req, res, next) => {
  Home.find().then((homes) => {
    res.render("store/home-list", {
      registeredHomes: homes,
      pageTitle: "Home List",
      currentPage: "Home",
      isLoggedIn: req.isLoggedIn,
      user: req.session.user,
    });
  });
};

exports.getHomeDetails = (req, res, next) => {
  const homeId = req.params.homeId;
  console.log(homeId);
  Home.findById(homeId)
    .then((home) => {
      console.log("home details found", home);
      if (!home) {
        res.redirect("/homes");
        console.log("home not found");
      } else {
        res.render("store/home-detail", {
          home: home,
          pageTitle: "Home Detail",
          currentPage: "Home",
          isLoggedIn: req.isLoggedIn,
          user: req.session.user,
        });
      }
    })
    .catch((error) => {
      console.log("error", error);
    });
};

exports.getFavouriteList = async (req, res, next) => {
  const userId = req.session.user._id;
  const user = await User.findById(userId).populate("favourites");
  console.log("user with favs", user);
  res.render("store/favourite-list", {
    favouriteHomes: user.favourites,
    pageTitle: "My Favourites",
    currentPage: "favourites",
    isLoggedIn: req.isLoggedIn,
    user: req.session.user,
  });
};

exports.postAddToFavourite = async (req, res, next) => {
  const homeId = req.body.id;
  const userId = req.session.user._id;
  const user = await User.findById(userId);
  if (!user.favourites.includes(homeId)) {
    user.favourites.push(homeId);
    await user.save();
  }
  res.redirect("/favourites");
};

exports.postRemoveFromFavourite = async (req, res, next) => {
  const homeId = req.params.homeId;
  const userId = req.session.user._id;
  const user = await User.findById(userId);
  if (user.favourites.includes(homeId)) {
    user.favourites = user.favourites.filter(
      (favId) => favId.toString() !== homeId
    );
    await user.save();
  }
  res.redirect("/favourites");
};

exports.getHouseRules = [
  (req, res, next) => {
    if (!req.session.isLoggedIn) {
      return res.redirect("/login");
    }
    next();
  },

  (req, res, next) => {
    const homeId = req.params.homeId;
    console.log("house rule for home id:", homeId);
    // house specific rules file --->
    // const rulesFileName = `House-Rules-${homeId}.pdf`
    // use it when rule file uploaded by host ---> save uploaded pdf in above naming format using multer
    const rulesFileName = `House-Rules.pdf`;
    const filePath = path.join(rootDir, "public", "rules", rulesFileName);
    res.download(filePath, "Rules.pdf");
  },
];

exports.getBookingPage = (req, res, next) => {
  // Check if user is logged in
  if (!req.session.isLoggedIn) {
    // Store the intended destination for redirect after login
    req.session.returnTo = `/booking/${req.params.homeId}`;
    return res.redirect("/login");
  }

  // Check if user is a guest
  if (req.session.user.userType !== "guest") {
    req.flash(
      "error",
      "Only guests can book properties. Please login as a guest."
    );
    return res.redirect("/");
  }

  const homeId = req.params.homeId;
  console.log("booking page for home id:", homeId);

  Home.findById(homeId)
    .then((home) => {
      if (!home) {
        return res.redirect("/");
      }

      // Check if the home belongs to the current user (host can't book their own property)
      if (
        home.hostId &&
        home.hostId.toString() === req.session.user._id.toString()
      ) {
        req.flash("error", "You cannot book your own property.");
        return res.redirect("/homes");
      }

      res.render("store/book-home", {
        home: home,
        pageTitle: "Request to Book",
        currentPage: "booking",
        isLoggedIn: req.isLoggedIn,
        user: req.session.user,
      });
    })
    .catch((error) => {
      console.log("error", error);
      res.redirect("/homes");
    });
};

const Booking = require("../models/booking");

exports.postBooking = async (req, res, next) => {
  // Check if user is logged in
  if (!req.session.isLoggedIn) {
    return res.redirect("/login");
  }

  // Check if user is a guest
  if (req.session.user.userType !== "guest") {
    req.flash(
      "error",
      "Only guests can book properties. Please login as a guest."
    );
    return res.redirect("/");
  }

  const { homeId, fromDate, toDate, specialRequests } = req.body;

  try {
    // Get the home details
    const home = await Home.findById(homeId);
    if (!home) {
      return res.redirect("/homes");
    }

    // Calculate booking details
    const startDate = new Date(fromDate);
    const endDate = new Date(toDate);
    const nights = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    const basePrice = nights * home.price;
    const serviceFee = Math.round(basePrice * 0.1);
    const totalPrice = basePrice + serviceFee;

    // Save booking to database
    const booking = new Booking({
      homeId: homeId,
      userId: req.session.user._id,
      fromDate: startDate,
      toDate: endDate,
      specialRequests: specialRequests,
      totalPrice: totalPrice,
      status: "pending",
    });
    await booking.save();

    res.redirect("/bookings");
  } catch (error) {
    console.error("Booking error:", error);
    res.redirect(`/booking/${homeId}`);
  }
};

exports.getBookings = async (req, res, next) => {
  if (!req.session.isLoggedIn) {
    return res.redirect("/login");
  }
  try {
    const bookings = await Booking.find({ userId: req.session.user._id })
      .populate("homeId")
      .sort({ createdAt: -1 });
    res.render("store/bookings", {
      bookings,
      pageTitle: "Your Bookings",
      currentPage: "bookings",
      isLoggedIn: req.isLoggedIn,
      user: req.session.user,
    });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.redirect("/");
  }
};
