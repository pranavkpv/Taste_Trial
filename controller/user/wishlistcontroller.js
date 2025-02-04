const wishlistschema = require("../../model/wishlistschema")
const cartschema = require("../../model/cartschema")
const rateschema = require("../../model/rateschema")
const { ObjectId } = require('mongodb');

const addToWishlist = async (req, res) => {
   try {
      console.log("hai")
      console.log(req.body)
      console.log(req.session.user)
    
         const newWishlist = new wishlistschema({
            rate_id: req.body.rateid,
            user_id: req.session.user
         })
         await newWishlist.save()
         return res.json({successWishlist: "SuccessFully Added to Wishlist"})
        
      
   } catch (error) {
      console.log(error)
   }
}

const wishlist = async (req, res) => {
   try {
      const userid = req.session.user
      const limit=3
      const selectedPage=req.query.page || 1
      const skip= (selectedPage-1)*limit
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
          },{$match:{user_id:new ObjectId(userid)}},{$skip:skip},{$limit:limit}])
          const count=wishlistData.length
          const page=Math.ceil(count/limit)
      const successmessage=req.flash('success')
      const carts=await cartschema.find({user_id:userid})
      console.log(carts)
      res.render('user/wishlist', { userid,page,selectedPage,carts, searchmessage: "", searcheditemname: "",wishlistData,successmessage })
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


const removeWishData= async(req,res)=>{
   try {
     
      const {userid,rateid}=req.body
      console.log(req.body)
      await wishlistschema.deleteOne({user_id:userid,rate_id:rateid})
      return res.json({removeMessage:"Data Removed SuccessFully"})
   } catch (error) {
      console.log(error)
   }
}

const AddToCart = async(req,res)=>{
   try {
      console.log("Haiiiiii")
      console.log(req.body)
      const userId=req.session.user
      const carts=await cartschema.findOne({rate_id:req.body.rateId})
      if(carts){
         return res.json({exist:"Product Already Exist In Cart"})
      }
      const rates=await rateschema.findOne({_id:req.body.rateId})
      console.log(rates)
      if(rates.stock==0){
         return res.json({nostock:"No stock Available"})
      }
      const newCarts=new cartschema({
         user_id:userId,
         rate_id:req.body.rateId,
         number:1
      })
      await newCarts.save()
      res.json({success:"SuccessFully Saved To AddToCart"})
   } catch (error) {
      console.log(error)
   }
}
module.exports = { addToWishlist, wishlist,removeWishlist,removeWishData,AddToCart}