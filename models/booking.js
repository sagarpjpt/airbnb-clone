// creating schema for booking
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
// External Module

const bookingSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    homeId: { type: Schema.Types.ObjectId, ref: "Home", required: true },
    fromDate: { type: Date, required: true },
    toDate: { type: Date, required: true },
    specialRequests: { type: String },
    totalPrice: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema); // Exporting the booking model


