// import mongoose from "mongoose";
const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
      required: true,
    },
    lastname: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    img: {
      type: String,
      default: null,
    },
    cart: {
      type: [
        {
          product: { type: mongoose.Schema.Types.ObjectId, ref: "Products" },
          quantity: { type: Number, default: 1 ,required: true},
          color: { type: String},
          size: { type: String},
        },
      ],
      default: [],
    },
    favourites: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Products"
    }],
    orders: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Orders",
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Users", UserSchema);