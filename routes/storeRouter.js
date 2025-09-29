// External Module
const express = require("express");
const storeRouter = express.Router();
const storeController = require("../controllers/storeController");

storeRouter.get("/", storeController.getIndex);
storeRouter.get("/favourites", storeController.getFavouriteList);
storeRouter.get("/homes", storeController.getHomes);
storeRouter.get("/homes/:homeId", storeController.getHomeDetails);
storeRouter.post("/favourites", storeController.postAddToFavourite);
storeRouter.post("/favourites/delete/:homeId",storeController.postRemoveFromFavourite);
storeRouter.get("/rules/:homeId", storeController.getHouseRules);

storeRouter.get("/booking/:homeId", storeController.getBookingPage);
storeRouter.post("/booking", storeController.postBooking);
storeRouter.get("/bookings", storeController.getBookings);
storeRouter.post("/bookings/delete/:bookingId",storeController.postDeleteBooking);

module.exports = storeRouter;
