const orderSchema = require('../../model/orderschema')
const cartshema = require('../../model/cartschema')
const mongoose = require("mongoose");
const cartschema = require('../../model/cartschema');
const { ObjectId } = mongoose.Types;


const failedOrder = async (req, res) => {
   try {
      const userId = req.session.user;

      if (!userId || !ObjectId.isValid(userId)) {
         return res.status(400).json({ error: "Invalid User ID" });
      }
      const userObjectId = new ObjectId(userId);

      const orders = await orderSchema.aggregate([
         { $match: { user_id: userObjectId, paidStatus: "failed" } },
         {
            $lookup: {
               from: "addresses",
               localField: "address_id",
               foreignField: "_id",
               as: "addressDetails"
            }
         }
      ]);

      const items = await orderSchema.aggregate([
         { $match: { user_id: userObjectId, paidStatus: "failed" } },
         { $unwind: "$items" }, // This makes `items` an object instead of an array
         {
            $lookup: {
               from: "rates",
               localField: "items.rate_id",
               foreignField: "_id",
               as: "rateDetails"
            }
         },
         {
            $lookup: {
               from: "foods",
               localField: "rateDetails.food_id",
               foreignField: "_id",
               as: "foodDetails"
            }
         },
         {
            $lookup: {
               from: "hotels",
               localField: "rateDetails.hotel_id",
               foreignField: "_id",
               as: "hotelDetails"
            }
         },
         {
            $lookup: {
               from: "varients",
               localField: "rateDetails.varient_id",
               foreignField: "_id",
               as: "varientDetails"
            }
         }
      ]);

      // FIXED: Handle single object case safely
      const rates = items.flatMap(element => {
         if (!element.items || typeof element.items !== "object") return [];
         return [new ObjectId(element.items.rate_id)];
      });

      // Fix: Handle empty rates array case
      const cartsID = rates.length > 0 ? await cartschema.find({ rate_id: { $in: rates } }) : [];

      // Fix: Ensure safe mapping for cart IDs and quantities
      const cartIDS = cartsID.map(cart => cart._id.toString());
      const purchaseQty = cartsID.map(cart => cart.number || 0);

      // Fix: Handle FinalAmount safely
      const FinalAmount = items.reduce((sum, element) => {
         return sum + ((element.totalAmount || 0) - (element.totalOffer || 0));
      }, 0);

      res.render('user/failedOrder', { searchmessage: "", searcheditemname: "", orders, items, FinalAmount, cartIDS, purchaseQty });
   } catch (error) {
      console.log("Error in failedOrder:", error);
      res.status(500).json({ error: "Internal Server Error" });
   }
};



module.exports = { failedOrder }