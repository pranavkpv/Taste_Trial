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
            amount: amount *100 , // Razorpay amount is in paise (1 INR = 100 paise)
            currency: currency || "INR",
            receipt: receipt || "receipt#1",
        };

        const order = await razorpayInstance.orders.create(options);
        res.status(200).json({
            success: true,
            order_id: order.id,
            amount: order.amount,
            currency: order.currency
        });
    } catch (error) {
        console.error("Error creating Razorpay order:", error);
        res.status(500).json({ success: false, message: "Error creating order", error });
    }
});

router.post("/failedOrder",async (req,res)=>{
    console.log("hai")
    console.log(req.body)
   try {
    console.log(req.body)
   } catch (error) {
    console.log(error)
   }
})

module.exports = router;
