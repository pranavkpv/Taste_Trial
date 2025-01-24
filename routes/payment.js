const Razorpay = require("razorpay");
const express = require("express");
const router = express.Router();

const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID, // Replace with your Key ID
    key_secret: process.env.RAZORPAY_KEY_SECRET, // Replace with your Key Secret
});

// Route to create an order
router.post("/create-order", async (req, res) => {

    try {
     
        const { amount,currency,receipt } = req.body;

        const options = {
            amount: amount * 100, // Razorpay amount is in paise (1 INR = 100 paise)
            currency: currency || "INR",
            receipt: receipt || "receipt#1",
        };

        const order = await razorpayInstance.orders.create(options);
        console.log(order)
        res.status(200).json({ success: true, order });
    } catch (error) {
        console.error("Error creating Razorpay order:", error);
        res.status(500).json({ success: false, message: "Error creating order", error });
    }
});

module.exports = router;
