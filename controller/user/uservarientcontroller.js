const rateschema=require('../../model/rateschema')
const userschema=require('../../model/usershema')
const foodschema=require('../../model/foodschema')
const hotelschema=require('../../model/hotelschema')
const { ObjectId } = require('mongodb');
const categoryschema = require('../../model/categoryschema');


const varient = async (req, res) => {
  const searcheditemname = req.query.varient;
  const price = req.query.price;

  // Build dynamic filter
  const searchFilter = searcheditemname
    ? { "varientDetails.varientname": { $regex: searcheditemname, $options: "i" } }
    : {};

  const foodId = req.query.foodId;
  const hotelId = req.query.hotelId;
  const foods=await foodschema.findOne({_id:foodId})
  const categorys=await categoryschema.findOne({_id:foods.category_id})

  const baseFilter = {
    food_id: new ObjectId(foodId),
    hotel_id: new ObjectId(hotelId),
  };

  const finalFilter = { ...baseFilter, ...searchFilter };

  try {
    let varients;
    if (price === "lth") {
      varients = await rateschema.aggregate([
        {
          $lookup: {
            from: "varients",
            localField: "varient_id",
            foreignField: "_id",
            as: "varientDetails",
          },
        },
        { $match: finalFilter },
        { $sort: { rate: 1 } },
      ]);
    } else if (price === "htl") {
      varients = await rateschema.aggregate([
        {
          $lookup: {
            from: "varients",
            localField: "varient_id",
            foreignField: "_id",
            as: "varientDetails",
          },
        },
        { $match: finalFilter },
        { $sort: { rate: -1 } },
      ]);
    } else if (!price) {
      varients = await rateschema.aggregate([
        {
          $lookup: {
            from: "varients",
            localField: "varient_id",
            foreignField: "_id",
            as: "varientDetails",
          },
        },
        { $match: finalFilter },
      ]);
    }

    const foods = await foodschema.findOne({ _id: foodId });
    const hotels = await hotelschema.findOne({ _id: hotelId });

    res.render("user/varient", { varients,price, searcheditemname, foods, hotels, searchmessage: "varients",categorys });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error retrieving variants.");
  }
};


module.exports={varient}