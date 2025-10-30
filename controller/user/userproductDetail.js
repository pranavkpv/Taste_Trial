const varientschema=require('../../model/varientschema')
const userschema=require('../../model/usershema')
const hotelschema=require('../../model/hotelschema')
const foodschema=require('../../model/foodschema')
const rateschema=require('../../model/rateschema')
const cartSchema=require('../../model/cartschema')
const categoryschema=require('../../model/categoryschema')
const wishlistSchema= require("../../model/wishlistschema")


const productDetail = async (req, res) => {
   try {
      const userid = req.session.user;
      const { varientid, hotelid, foodid, rateid } = req.query;
      const varients = await varientschema.findOne({ _id: varientid });
      const hotels = await hotelschema.findOne({ _id: hotelid });
      const foods = await foodschema.findOne({ _id: foodid });
      const rates = await rateschema.findOne({ _id: rateid });
      const categories = await categoryschema.findOne({_id:foods.category_id})
      const wishlistData = await wishlistSchema.findOne({user_id:userid,rate_id:rateid})


      const successmessage = req.flash('success'); // Read success flash message
      const errormessage = req.flash('error'); // Read error flash message

      res.render('user/productDetail', {
         varients,
         hotels,
         foods,
         rates,
         errormessage,
         successmessage,
         searcheditemname: "",
         searchmessage: "",
         userid,
         categories,
         wishlistData
      });
   } catch (error) {
      console.error(error);
   }
};



const productcart = async (req, res) => {
   try {
      const userid = req.session.user;
      if(!userid){
         return res.json({error:"Please Login To Continue"})
      }
      const carts = await cartSchema.find({ user_id: userid });
      const rates = await rateschema.findOne({ _id: req.body.rateid });
      if(!userid){
        return res.json({noUser: "please login for continue"});
      }

      if (parseInt(req.body.numberofstock) > parseInt(rates.stock)) {
        
        return res.json({stockError: "Please check the total No of stock Available"});
      }

      let exists = false;
      carts.forEach((element) => {
         if (rates._id.toString() === element.rate_id.toString()) {
            exists = true;
         }
      });

      if (exists) {
        
         return res.json({existProduct: "Product is Already Exist in the cart"});
      } 
   
         const newCart = new cartSchema({
            user_id: userid,
            rate_id: rates._id,
            number: parseInt(req.body.numberofstock),
         });
         await newCart.save();
         return res.json({success: "Product Added to Cart Successfully"});
      
   } catch (error) {
      console.error(error);
      return res.json({error:"Something Went Wrong"})
   }
};


module.exports={productDetail,productcart}
