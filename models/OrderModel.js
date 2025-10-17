const mongoose = require('mongoose');

const OrdersSchema = new mongoose.Schema(
  {
    products: {
      type: [
        {
          product: { type: mongoose.Schema.Types.ObjectId, ref: "Products" },
          quantity: { type: Number, default: 1 },
        },
      ],
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    total_amount: {
      type: mongoose.Types.Decimal128,
      required: true,
    },
    address: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      default: "Payment Done",
    },
    subtotal: {
      type: mongoose.Decimal128,
      required: true

    },
    shipping: {
      type: mongoose.Decimal128,
      required: true

    },
    tax: {
      type: mongoose.Decimal128,
      required: true

    },
    discount: {
      type: mongoose.Decimal128,
      default: 0

    }

  },
  { timestamps: true }
);

module.exports = mongoose.model("Orders", OrdersSchema);