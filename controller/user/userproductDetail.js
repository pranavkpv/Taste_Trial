const varientschema=require('../../model/varientschema')
const userschema=require('../../model/usershema')
const hotelschema=require('../../model/hotelschema')
const foodschema=require('../../model/foodschema')
const rateschema=require('../../model/rateschema')
const cartSchema=require('../../model/cartschema')
const categoryschema=require('../../model/categoryschema')


const productDetail = async (req, res) => {
   try {
      const userid = req.session.user;
      const { varientid, hotelid, foodid, rateid } = req.query;
      const varients = await varientschema.findOne({ _id: varientid });
      const hotels = await hotelschema.findOne({ _id: hotelid });
      const foods = await foodschema.findOne({ _id: foodid });
      const rates = await rateschema.findOne({ _id: rateid });
      const categories = await categoryschema.findOne({_id:foods.category_id})

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
         categories
      });
   } catch (error) {
      console.error(error);
   }
};



const productcart = async (req, res) => {
   try {
      const userid = req.session.user;
      const carts = await cartSchema.find({ user_id: userid });
      const rates = await rateschema.findOne({ _id: req.body.rateid });

      if (parseInt(req.body.numberofstock) > parseInt(rates.stock)) {
         req.flash('error', "Please check the total No of stock Available");
         return res.redirect(`/user/productDetail?varientid=${req.body.varientid}&hotelid=${req.body.hotelid}&foodid=${req.body.foodid}&rateid=${req.body.rateid}`);
      }

      let exists = false;
      carts.forEach((element) => {
         if (rates._id.toString() === element.rate_id.toString()) {
            exists = true;
         }
      });

      if (exists) {
         req.flash('error', "Product is Already Exist in the cart");
         return res.redirect(`/user/productDetail?varientid=${req.body.varientid}&hotelid=${req.body.hotelid}&foodid=${req.body.foodid}&rateid=${req.body.rateid}`);
      } else {
         // Add product to cart
         const newCart = new cartSchema({
            user_id: userid,
            rate_id: rates._id,
            number: parseInt(req.body.numberofstock),
         });
         await newCart.save();
         req.flash('success', "Product Added to Cart Successfully");
         res.redirect(`/user/productDetail?varientid=${req.body.varientid}&hotelid=${req.body.hotelid}&foodid=${req.body.foodid}&rateid=${req.body.rateid}`);
      }
   } catch (error) {
      console.error(error);
   }
};


module.exports={productDetail,productcart}
