const Razorpay = require("razorpay");
const express = require("express");
const router = express.Router();
const addressSchema=require('../model/addressschema')
const locationSchema=require('../model/locationSchema')

const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID, // Replace with your Key ID
    key_secret: process.env.RAZORPAY_KEY_SECRET, // Replace with your Key Secret
});

// Route to create an order
router.post("/create-order", async (req, res) => {

    try {
          const addressId=req.body.addressSelect
          const address=await addressSchema.findOne({_id:addressId})
          const location = await locationSchema.findOne({_id:address.location_id})
         if(req.body.addressSelect=="" || !req.body.addressSelect){
            return res.json({address:"Please Select Address If No Address Exist Please Add Address"})
         }
        const { amount,currency,receipt } = req.body;

        const options = {
            amount: (amount + location.deliveryCharge) *100 , 
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



module.exports = router;
