const cloudinary = require("../utils/cloudinary");
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

exports.postAddHome = async (req, res, next) => {
  const { houseName, price, location, rating, description } = req.body;
  console.log("added new home details: ", req.body);
  console.log("file details: ", req.file);
  if (!req.file) {
    return res.status(422).send("No Image Provided");
  }

  // Convert buffer to base64 string
  const fileBase64 = req.file.buffer.toString("base64");
  const dataURI = `data:${req.file.mimetype};base64,${fileBase64}`;

  // Upload directly to Cloudinary (no temp file)
  const result = await cloudinary.uploader.upload(dataURI, {
    folder: "airbnb-clone",
  });

  const photo = result.secure_url;
  console.log("Cloudinary upload result:", result);
  console.log("Photo URL:", photo);

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
    .then(async (home) => {
      home.houseName = houseName;
      home.price = price;
      home.location = location;
      home.rating = rating;
      home.description = description;
      if (req.file) {
        // first delete the previous photo from cloudinary
        function getPublicIdFromUrl(url) {
          const parts = url.split("/upload/")[1]; // "v1759258745/airbnb-clone/pkhhhf1issoglbh3fewc.webp"
          const pathParts = parts.split("/").slice(1); // ["airbnb-clone", "pkhhh..."]
          const filenameWithExt = pathParts.join("/"); // "airbnb-clone/pkhhhf1issoglbh3fewc.webp"
          return filenameWithExt.replace(/\.[^/.]+$/, ""); // remove extension -> "airbnb-clone/pkhhhf1issoglbh3fewc"
        }

        const publicId = getPublicIdFromUrl(home.photo);
        await cloudinary.uploader.destroy(publicId);

        // Convert buffer to base64 string
        const fileBase64 = req.file.buffer.toString("base64");
        const dataURI = `data:${req.file.mimetype};base64,${fileBase64}`;

        // Upload directly to Cloudinary (no temp file)
        const result = await cloudinary.uploader.upload(dataURI, {
          folder: "airbnb-clone",
        });

        const photo = result.secure_url;
        home.photo = photo;
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
  // first delete image from cloudinary then delete home from mongoDB
  Home.findById(homeId)
    .then(async (home) => {
      if (!home) {
        return res.send("home not found");
      }
      function getPublicIdFromUrl(url) {
        const parts = url.split("/upload/")[1]; // "v1759258745/airbnb-clone/pkhhhf1issoglbh3fewc.webp"
        const pathParts = parts.split("/").slice(1); // ["airbnb-clone", "pkhhh..."]
        const filenameWithExt = pathParts.join("/"); // "airbnb-clone/pkhhhf1issoglbh3fewc.webp"
        return filenameWithExt.replace(/\.[^/.]+$/, ""); // remove extension -> "airbnb-clone/pkhhhf1issoglbh3fewc"
      }
      const publicId = getPublicIdFromUrl(home.photo);
      await cloudinary.uploader.destroy(publicId);
    })
    .catch((err) => {
      console.log("error while deleting file", err);
    });
  Home.findByIdAndDelete(homeId)
    .then(() => {
      res.redirect("/host/host-home-list");
    })
    .catch((err) => {
      console.log("error while deleting file", err);
    });
};
