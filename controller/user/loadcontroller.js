const categoryschema = require('../../model/categoryschema')
const orderschema = require('../../model/orderschema')
const userload = async (req, res) => {
   try {
      const categoryOrder = await orderschema.aggregate([{
         $lookup: {
            from: "rates",
            localField: "items.rate_id",
            foreignField: "_id",
            as: "rateDetails"
         }
      }, {
         $lookup: {
            from: "foods",
            localField: "rateDetails.food_id",
            foreignField: "_id",
            as: "foodDetails"
         }
      }, {
         $lookup: {
            from: "categories",
            localField: "foodDetails.category_id",
            foreignField: "_id",
            as: "categoryDetails"
         }
      }, { $unwind: "$categoryDetails" },
      {
         $group: { _id: "$categoryDetails._id", categoryname: { $first: "$categoryDetails.categoryname" }, count: { $sum: 1 } }
      }, {
         $sort: { count: -1 }
      }, { $limit: 10 }
      ])


      const foodOrder = await orderschema.aggregate([{
         $lookup: {
            from: "rates",
            localField: "items.rate_id",
            foreignField: "_id",
            as: "rateDetails"
         }
      }, {
         $lookup: {
            from: "foods",
            localField: "rateDetails.food_id",
            foreignField: "_id",
            as: "foodDetails"
         }
      }, { $unwind: "$foodDetails" },
      {
         $group: { _id: "$foodDetails._id", foodname: { $first: "$foodDetails.foodname" }, images: { $first: "$foodDetails.image" }, count: { $sum: 1 } }
      }, {
         $sort: { count: -1 }
      }, { $limit: 10 }
      ])


      const hotelOrder = await orderschema.aggregate([{
         $lookup: {
            from: "rates",
            localField: "items.rate_id",
            foreignField: "_id",
            as: "rateDetails"
         }
      }, {
         $lookup: {
            from: "hotels",
            localField: "rateDetails.hotel_id",
            foreignField: "_id",
            as: "hotelDetails"
         }
      }, { $unwind: "$hotelDetails" },
      {
         $group: { _id: "$hotelDetails._id", hotelname: { $first: "$hotelDetails.hotelname" }, images: { $first: "$hotelDetails.image" },address:{$first:"$hotelDetails.hoteladdress"}, count: { $sum: 1 } }
      }, {
         $sort: { count: -1 }
      }, { $limit: 10 }
      ])


      const successsavemessage = req.flash('successsavemessage')
      res.render('user/load', { successsavemessage, categoryOrder, foodOrder,hotelOrder });
   } catch (error) {
      console.log("Error:", error);
      res.status(500).json({ message: "Internal server error" });
   }
};


module.exports = { userload }