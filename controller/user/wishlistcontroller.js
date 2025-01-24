const wishlistschema = require("../../model/wishlistschema")
const { ObjectId } = require('mongodb');

const addToWishlist = async (req, res) => {
   try {
      console.log(req.body)
      console.log(req.session.user)
      const existProduct = await wishlistschema.findOne({ rate_id: req.body.rateid, user_id: req.session.user })
      if (existProduct) {
         req.flash('error', "The product Already Exist")
         res.redirect('/user/productDetail')
      } else {
         const newWishlist = new wishlistschema({
            rate_id: req.body.rateid,
            user_id: req.session.user
         })
         await newWishlist.save()
         req.flash('success', "SuccessFully Added to Wishlist")
         res.redirect('/user/productDetail')
      }
   } catch (error) {
      console.log(error)
   }
}

const wishlist = async (req, res) => {
   try {
      const userid = req.session.user
      const wishlistData = await wishlistschema.aggregate([{$lookup:{
          from:"rates",
          localField:"rate_id",
          foreignField:"_id",
          as:"rateDetails"
          }},{
            $lookup:{
               from:"foods",
               localField:"rateDetails.food_id",
               foreignField:"_id",
               as:"foodDetails"
            }
          },{
            $lookup:{
               from:"categories",
               localField:"foodDetails.category_id",
               foreignField:"_id",
               as:"categoryDetails"
            }
          },{
            $lookup:{
               from:"varients",
               localField:"rateDetails.varient_id",
               foreignField:"_id",
               as:"varientDetails"
            }
          },{
            $lookup:{
               from:"hotels",
               localField:"rateDetails.hotel_id",
               foreignField:"_id",
               as:"hotelDetails"
            }
          },{$match:{user_id:new ObjectId(userid)}}])
      const successmessage=req.flash('success')
      res.render('user/wishlist', { userid, searchmessage: "", searcheditemname: "",wishlistData,successmessage })
   } catch (error) {
      console.log(error)
   }
}

const removeWishlist = async(req,res)=>{
   try {
      const {removeid}=req.body
      await wishlistschema.findByIdAndDelete({_id:removeid})
      req.flash('success',"The Itema Removed SuccessFully")
      res.redirect('/user/wishlist')
   } catch (error) {
      console.log(error)
   }
}

module.exports = { addToWishlist, wishlist,removeWishlist }