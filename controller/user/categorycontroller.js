const wishlistschema = require('../../model/wishlistschema');
const rateschema = require('../../model/rateschema')

const category = async (req, res) => {
  try {
    const searcheditemname = req.query.product || '';
    const userId = req.session.user;

    const matchFilter = searcheditemname
      ? { "foodDetails.foodname": { $regex: searcheditemname, $options: "i" } }
      : {};

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
      },
      {
        $lookup: {
          from: "categories",
          localField: "foodDetails.category_id",
          foreignField: "_id",
          as: "CategoryDetails"
        }
      },
      { $match: matchFilter }
    ]);

    // Add wishlist status
    for (const rate of rates) {
      const wishlistItem = await wishlistschema.findOne({
        rate_id: rate._id,
        user_id: userId
      });
      rate.isInWishlist = !!wishlistItem; // Boolean conversion
    }

    res.render('user/category', {
      rates,
      searchmessage: "foodname",
      searcheditemname,
      userId
    });
  } catch (error) {
    console.error('Category controller error:', error);
    res.status(500).send('Internal Server Error');
  }
};

module.exports = { category };
