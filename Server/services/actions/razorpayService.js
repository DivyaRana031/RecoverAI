const razorpay = require("../../config/razorpay");

const createRazorpayOrder = async ({
  amount,
  currency = "INR",
  receipt,
}) => {
  const order = await razorpay.orders.create({
    amount: Math.round(amount * 100),
    currency,
    receipt,
  });

  return order;
};

module.exports = {
  createRazorpayOrder,
};