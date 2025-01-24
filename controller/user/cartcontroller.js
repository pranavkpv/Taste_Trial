
const cartSchema = require('../../model/cartschema')
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

const cart = async (req, res) => {
   try {
       const searcheditemname = req.query.product || ''; // Get the search query
       // Parse pagination parameters
       const selectedpage = parseInt(req.query.pagenumber) || 1; // Default to page 1 if not provided
       const limit = 4; // Default limit to 4 items per page
       const skip = (selectedpage - 1) * limit; // Calculate the number of documents to skip
       const userid = req.session.user;

       // Search filter
       const searchFilter = searcheditemname
           ? { "foodDetails.foodname": { $regex: searcheditemname, $options: 'i' } }
           : {};

       // Aggregation pipeline for paginated cart data
       const carts = await cartSchema.aggregate([
           { $match: { user_id: new ObjectId(userid) } },
           {
               $lookup: {
                   from: "rates",
                   localField: "rate_id",
                   foreignField: "_id",
                   as: "rateDetails",
               },
           },
           {
               $unwind: {
                   path: "$rateDetails",
                   preserveNullAndEmptyArrays: true,
               },
           },
           {
               $lookup: {
                   from: "foods",
                   localField: "rateDetails.food_id",
                   foreignField: "_id",
                   as: "foodDetails",
               },
           },
           {
               $unwind: {
                   path: "$foodDetails",
                   preserveNullAndEmptyArrays: true,
               },
           },
           {
               $lookup: {
                   from: "hotels",
                   localField: "rateDetails.hotel_id",
                   foreignField: "_id",
                   as: "hotelDetails",
               },
           },
           {
               $lookup: {
                   from: "varients",
                   localField: "rateDetails.varient_id",
                   foreignField: "_id",
                   as: "varientDetails",
               },
           },{
            $lookup:{
                from:"categories",
                localField:"foodDetails.category_id",
                foreignField:"_id",
                as:"categoryDetails"
            }
           },
           { $match: searchFilter },
           { $skip: skip },
           { $limit: limit },
       ]);
       

       // Aggregate total amount across all items in the cart
       const totalAmountData = await cartSchema.aggregate([
           { $match: { user_id: new ObjectId(userid) } },
           {
               $lookup: {
                   from: "rates",
                   localField: "rate_id",
                   foreignField: "_id",
                   as: "rateDetails",
               },
           },
           {
               $unwind: {
                   path: "$rateDetails",
                   preserveNullAndEmptyArrays: true,
               },
           },
           {
               $lookup: {
                   from: "foods",
                   localField: "rateDetails.food_id",
                   foreignField: "_id",
                   as: "foodDetails",
               },
           },
           {
               $unwind: {
                   path: "$foodDetails",
                   preserveNullAndEmptyArrays: true,
               },
           },
           {
               $group: {
                   _id: null,
                   totalAmount: {
                       $sum: {
                           $add: [
                               "$rateDetails.rate",
                               {
                                   $multiply: [
                                       "$rateDetails.rate",
                                       { $divide: ["$rateDetails.gst_per", 100] },
                                   ],
                               },
                           ],
                       },
                   },
               },
           },
       ]);

       const totalAmount = totalAmountData.length > 0 ? totalAmountData[0].totalAmount : 0;

       // Get total document count for pagination metadata
       const totalDocuments = await cartSchema.aggregate([
           { $match: { user_id: new ObjectId(userid) } },
           {
               $lookup: {
                   from: "rates",
                   localField: "rate_id",
                   foreignField: "_id",
                   as: "rateDetails",
               },
           },
           {
               $unwind: {
                   path: "$rateDetails",
                   preserveNullAndEmptyArrays: true,
               },
           },
           {
               $lookup: {
                   from: "foods",
                   localField: "rateDetails.food_id",
                   foreignField: "_id",
                   as: "foodDetails",
               },
           },
           {
               $unwind: {
                   path: "$foodDetails",
                   preserveNullAndEmptyArrays: true,
               },
           },
           { $match: searchFilter },
           { $count: "total" },
       ]);

       // Calculate total pages
       const successmessage = req.flash('success');
       const totaldata = totalDocuments.length > 0 ? totalDocuments[0].total : 0;
       const totalPages = Math.ceil(totaldata / limit);
    

       // Render response
       res.render('user/cart', {
           userid,
           carts,
           successmessage,
           totalPages,
           selectedpage,
           searchmessage: "foodname",
           searcheditemname,
           totalAmount,
       });
   } catch (error) {
       console.log(error);
   }
};


const removeCart = async (req, res) => {
   try {
      const { cartid } = req.body
      await cartSchema.findByIdAndDelete({ _id: cartid })
      req.flash('success', "Product Removed From Cart SuccessFully")
      res.redirect('/user/cart')
   } catch (error) {
      console.log(error)
   }
}


module.exports = {
   cart,
   removeCart
}