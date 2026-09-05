require("dotenv").config();

const mongoose = require("mongoose");

const { createRazorpayOrder } = require("./razorpayService");

const test = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected");

    const order = await createRazorpayOrder({
      amount: 2999,
      currency: "INR",
      receipt: `recoverai_${Date.now()}`,
    });

    console.log("\n================================");
    console.log("RAZORPAY TEST ORDER");
    console.log("================================");

    console.log({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      status: order.status,
      receipt: order.receipt,
    });

    await mongoose.disconnect();

    console.log("\nMongoDB disconnected");
  } catch (error) {
    console.error(
      "\nRazorpay test failed:",
      error.message
    );

    await mongoose.disconnect();
  }
};

test();