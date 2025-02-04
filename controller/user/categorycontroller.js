const rateschema=require('../../model/rateschema')
const wishlistschema=require('../../model/wishlistschema')

const category = async (req, res) => {
   try {
       const userId = req.session.user;
       const rates = await rateschema.aggregate([
           {
               $lookup: {
                   from: "foods",
                   localField: "food_id",
                   foreignField: "_id",
                   as: "foodDetails"
               }
           },
           {
               $lookup: {
                   from: "hotels",
                   localField: "hotel_id",
                   foreignField: "_id",
                   as: "hotelDetails"
               }
           },
           {
               $lookup: {
                   from: "varients",
                   localField: "varient_id",
                   foreignField: "_id",
                   as: "varientDetails"
               }
           }
       ]);

       // Check wishlist status for each product
       for (const rate of rates) {
           const wishlistItem = await wishlistschema.findOne({
               rate_id: rate._id,
               user_id: userId
           });
           rate.isInWishlist = !!wishlistItem; // Convert to boolean
       }

       res.render('user/category', {
           rates,
           searchmessage: "",
           searcheditemname: "",
           userId
       });
   } catch (error) {
       console.error('Category controller error:', error);
       res.status(500).send('Internal Server Error');
   }
};


module.exports = { category }