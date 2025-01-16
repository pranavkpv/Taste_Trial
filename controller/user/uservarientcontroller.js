const rateschema=require('../../model/rateschema')
const userschema=require('../../model/usershema')
const foodschema=require('../../model/foodschema')
const hotelschema=require('../../model/hotelschema')
const { ObjectId } = require('mongodb');


const varient=async(req,res)=>{
  const searcheditemname= req.query.varient;
  // Build dynamic filter
  const searchFilter = searcheditemname
    ? { "varientDetails.varientname": { $regex: searcheditemname, $options: 'i' } }
    : {};

  const foodId = req.query.foodId;
  const hotelId = req.query.hotelId;

  const baseFilter = {
    food_id: new ObjectId(foodId),
    hotel_id: new ObjectId (hotelId),
  };

  const finalFilter = { ...baseFilter, ...searchFilter };

  try {
    const varients = await rateschema.aggregate([
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
   
   const foods=await foodschema.findOne({_id:foodId})
   const hotels=await hotelschema.findOne({_id:hotelId})

    res.render('user/varient', { varients, searcheditemname,foods,hotels,searchmessage:"varients" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error retrieving variants.");
  }
}


module.exports={varient}