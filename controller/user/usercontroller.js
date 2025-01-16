const userschema = require('../../model/usershema')
const categoryschema = require('../../model/categoryschema')
const bannerschema = require('../../model/bannerschema')
const foodschema = require('../../model/foodschema')
const hotelschema = require('../../model/hotelschema')
const cartSchema = require('../../model/cartschema')
const nodemailer = require('nodemailer')
const addressschema = require('../../model/addressschema')
const orderSchema = require("../../model/orderschema")
const rateschema=require("../../model/rateschema")
const env = require("dotenv").config()
const { ObjectId } = require('mongodb');
const orderschema = require('../../model/orderschema')
const cartschema = require('../../model/cartschema')
const mongoose = require('mongoose');


// userlogin get
const userlogin=async(req,res)=>{
   try {
      const notExistmessage = req.flash('exist')
      const nocontendmessage = req.flash('nocontend')
      const successmessage=req.flash('success')
      const errormessage=req.flash('error')
      res.render("user/login",{notExistmessage,nocontendmessage,successmessage,errormessage})
   } catch (error) {
      console.log(error)
      req.flash("error","An Error Occured")
      res.redirect('/user/login')
   }
}

// userlogin check
const validuser=async(req,res)=>{
   try {
      const {email,password}=req.body
      const existuser = await userschema.findOne({email,password})
     if(!email || !password){
         req.flash("nocontend","Please fill username and password")
         res.redirect('/user/login')
      }else  if(!existuser){
        
         req.flash("exist","Username or Password is Wrong")
         res.redirect('/user/login')
         
      }else if(existuser.is_blocked===true){
         req.flash("exist","User is block to access")
         res.redirect('/user/login')
      }
      else{
         const users=await userschema.findOne({email:email})
         req.session.user=users._id
         req.flash("success","Login SuccessFully")
         res.redirect("/user/home")
      }
   } catch (error) {
      console.log(error)
      req.flash("error","An Error Occured")
       res.redirect('/user/login')
   }
  
}



// user signup
const usersignup=async(req,res)=>{
   try {
      const exitusermessage = req.flash("exist")
      const nocondentmessage = req.flash("nocondent")
      const successsavemessage = req.flash("success")
      const errormessage = req.flash("error")
     
      res.render("user/signup",{exitusermessage,nocondentmessage,errormessage,
         successsavemessage})
   } catch (error) {
      console.log(error)
   }
}

function generateOTP(){
   return Math.floor(100000 + Math.random()*900000).toString();
}


// signup
const adduser = async (req, res) => {
   try {
      const { firstname, lastname, phonenumber, email, password, confirmpassword } = req.body;
      req.session.userData={
         email,
         firstname,
         lastname,
         phonenumber,
         password
      }
      

      if (firstname === "" || lastname === "" || phonenumber === "" || email === "" || password === "" || confirmpassword === "") {
         req.flash("nocondent", "Please fill all the fields");
         return res.redirect("/user/signup");
      }
      if(password.length<8){
         req.flash("error", "Atleast Password contains 8 character");
         return res.redirect("/user/signup");
      }

      if (password !== confirmpassword) {
         req.flash("error", "Password does not match");
         return res.redirect("/user/signup");
      }
      const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&#^()\-_=+{}[\]<>])[A-Za-z\d@$!%*?&#^()\-_=+{}[\]<>]{8,}$/;
      if(!passwordRegex.test(password)){
         req.flash("error", "Password must include at least one uppercase letter, one lowercase letter, one number, one special character, and be at least 8 characters long.");
         return res.redirect("/user/signup");
      }
      const numRegex = /^[0-9]{10}$/;
      if(!numRegex.test(phonenumber)){
         req.flash("error", "Please Check Phone number");
         return res.redirect("/user/signup");
      }
      const existuser = await userschema.findOne({ email });

      if (existuser) {
         if (existuser.is_blocked === true) {
            req.flash("exist", "The user is blocked");
            return res.redirect("/user/signup");
         } else {
            req.flash("exit", "User already exists");
            return res.redirect("/user/signup");
         }
      }

      const Otp = generateOTP();
      console.log("OTP generated: ", Otp); // Log OTP
      const emailSend = await sendverificationEmal(email, Otp);
      
     
      if (!emailSend) {
         req.flash("error", "OTP is not send");
         return res.redirect("/user/signup");
      }
      const errormessage=req.flash('error')
      const successmessage=req.flash('success')
      res.render("user/verifyOTP",{successmessage,errormessage,message:Otp,firstname:firstname,lastname:lastname,phonenumber:phonenumber,email:email,password:password});
   } catch (error) {
      console.log(error);
   }
};

async function sendverificationEmal(email,Otp){
   try {
     const transporter = nodemailer.createTransport({
        service:'gmail',
        port:587,
        secure:false,
        requireTLS:true,
        auth:{
           user:process.env.NODEMAILER_EMAIL,
           pass:process.env.NODEMAILER_PASSWORD
        }
     })

     const info=await transporter.sendMail({
        from:process.env.NODEMAILER_EMAIL,
        to: email,
        subject:"verify your account",
        text:`Your OTP is ${Otp}`,
        html:`<b> Your OTP :${Otp}`
     })
     return info.accepted.length>0
   } catch (error) {
     console.error("Error Sending Email",error)
     return false
   }
}


const verifyOTP=(req,res)=>{
   const errormessage=req.flash('error')
   const successmessage=req.flash('success')
   res.render('user/verifyOTP',errormessage,successmessage)
}



const verifyOTPpost = async (req, res) => {
   try {
      console.log("hai")
      const { Otp,actualotp,firstname,lastname,phonenumber,email,password } = req.body;
      if (Otp!==actualotp){
         const errormessage=req.flash('error')
         const successmessage=req.flash('success')
        
         req.flash('error',"Entered OTP is not Valid")
         res.redirect('/user/login');
      }
         else{
            const newUser = new userschema({
               firstname,
               lastname,
               phonenumber,
               email,
               password
            });
            await newUser.save();
            req.flash('success',"successfully created the user")
            res.redirect('/user/login')

         }
   } catch (error) {
      console.error('Error in OTP verification:', error);
   }
};

// home page







const showfoodDetail=async(req,res)=>{
   try {
      const {foodid,hotelid,userid}=req.body
      const foods=await foodschema.find({_id:foodid,is_blocked:false})
      const hotels=await hotelschema.find({_id:hotelid})
      const users=await userschema.find({_id:userid})
      res.render('user/productDetail',{foods,hotels,users})
   } catch (error) {
      
   }
}
const forgotpassword=async(req,res)=>{
   try {
      const existmessage=req.flash('exist')
      const successmessage=req.flash('success')
      const errormessage=req.flash('error')
      res.render('user/forgotpassword',{existmessage,successmessage,errormessage})
   } catch (error) {
      console.log(error)
   }
}

const emailverification=async(req,res)=>{
   try {
      const {email}=req.body
      
      const existuser=await userschema.findOne({email})
      if(!existuser){
         req.flash("exist", "User is not Exist");
         res.redirect("/user/login");
      }else{
         const Otp = generateOTP();
         console.log("OTP generated: ", Otp); // Log OTP
         const emailSend = await sendverificationEmal(email, Otp);    
         if (!emailSend) {
            req.flash("error", "OTP is not send");
            return res.redirect("/user/login");
         }else{
            const errormessage=req.flash('error')
            const userId=await userschema.findOne({email:email})
            res.render('user/verify',{userId,message:Otp,errormessage})
         }
      }
      
   } catch (error) {
      console.log(error)
   }
}

const verify=async(req,res)=>{
   try {

      const errormessage=req.flash('error')
      res.render('user/verify',{errormessage})
   } catch (error) {
      console.log(error)
   }
}
const verifypost=async(req,res)=>{
   try {
      const {message,Otp,id}=req.body
      if(message!==Otp){
         req.flash('error',"Entered OTP is wrong try again")
         res.redirect('/user/login')
      }else{  
         const user=await userschema.findOne({_id:id})
         res.render('user/confirmpassword',{user})
      }
     
   } catch (error) {
      console.log(error)
   }
}


 

 
 
 
const confirmpassword=async(req,res)=>{
   try {
      res.render('user/confirmpassword')
   } catch (error) {
      
   }
}

const confirmPassword=async(req,res)=>{
   try {
   console.log("hai")
     const {userid,password,confirmpassword}=req.body
     if(password!==confirmpassword){
      req.flash('error',"Invalid Pssword")
      res.redirect('/user/login')
     }else{
      await userschema.findByIdAndUpdate({_id:userid},{password:password})
      req.flash('success',"Password Changed Successfully")
      res.redirect('/user/login')
     }
         
      
   } catch (error) {
      console.log(error)
   }
}

// profile

const profile = (req,res)=>{
   try {
      res.render('user/profile')
   } catch (error) {
      
   }
}

//review

const review = (req,res)=>{
   try {
      res.render('user/review')
   } catch (error) {
      
   }
}



//order
const order = (req,res)=>{
   try {
      res.render('user/order')
   } catch (error) {
      
   }
}
const confirmorder=async(req,res)=>{
   try {
      const userid=req.query.userid
      const cartIds=req.query.cartIDS.split(',')
      cartIds.forEach(element => new ObjectId(element));
      const addressess=await addressschema.find({user_id:userid})
      const successmessage=req.flash('success')
      const datas=await cartSchema.aggregate([{$match:{user_id:new ObjectId(userid),_id: { $in: cartIds.map(id => new ObjectId(id))}}},{ $lookup: { from: "rates", localField: "rate_id", foreignField: "_id", as: "rateDetails" } }, { $unwind: { path: "$rateDetails", preserveNullAndEmptyArrays: true /* Use this if some cart items might not have matching rates*/ } }, { $lookup: { from: "foods", localField: "rateDetails.food_id", foreignField: "_id", as: "foodDetails" } },{$lookup:{from:"hotels",localField:"rateDetails.hotel_id",foreignField:"_id",as:"hotelDetails"}},{$lookup:{from:"varients",localField:"rateDetails.varient_id",foreignField:"_id",as:"varientDetails"}}])    
      res.render('user/confirmorder',{userid,cartIds,addressess,datas,successmessage});

   } catch (error) {
      console.log(error)
   }
}

const orderSuccess = async (req, res) => {
   try {
      const { addressId, cartId, selectedPaymentMethod, userid } = req.body;

      // Convert cartId to valid ObjectIds
      const cartIdArray = Array.isArray(cartId) ? cartId : [cartId];
      const validCartIds = cartIdArray.map(id => new mongoose.Types.ObjectId(id));

      // Fetch cart details and populate rate_id
      const cartDetails = await cartSchema.find({ _id: { $in: validCartIds } }).populate('rate_id');

      // Extract rate IDs and fetch rate details
      const rateIds = cartDetails.map(item => item.rate_id);
      const rateDetails = await rateschema.find({ _id: { $in: rateIds } });
      

      // Update stocks
      const stocks = cartDetails.map(item => item.number);
      for (let i = 0; i < stocks.length; i++) {
         await rateschema.updateOne(
            { _id: rateIds[i] },
            { $inc: { stock: -stocks[i] } }
         );
      }

      // Prepare item details for the order
      const itemdetails = cartDetails.map((cartItem) => {
         const rateDetail = cartItem.rate_id;    
         const totalAmount = cartItem.number * (
            rateDetail.rate +
            rateDetail.gst_per +
            rateDetail.packing_per +
            rateDetail.delivery_per
         );
         return {
            rate_id: cartItem.rate_id, // this will now contain the populated rate info
            quantity: cartItem.number,
            total_amount: totalAmount,
         };
      });

      // Create new order
      const newOrder = new orderschema({
         user_id: userid,
         paymentmethod: selectedPaymentMethod,
         address_id: addressId,
         items: itemdetails,
      });

      await newOrder.save();

      // Remove cart items
      await cartSchema.deleteMany({ _id: { $in: validCartIds } });

      req.flash('success', "Order Placed Successfully");
      res.redirect(`/user/cart/${cartId}`);

   } catch (error) {
      console.error(error);
      res.status(500).send("An error occurred while placing the order.");
   }
};



// cart
const cart = (req,res)=>{
   try {
      res.render('user/cart')
   } catch (error) {
      
   }
}

//wishlist
const wishlist = (req,res)=>{
   try {
      res.render('user/wishlist')
   } catch (error) {
      
   }
}

//wallet
const wallet = (req,res)=>{
   try {
      res.render('user/wallet')
   } catch (error) {
      
   }
}

//changeaccount
const change = (req,res)=>{
   try {
      res.render('user/change')
   } catch (error) {
      
   }
}


   const logout = async (req, res) => {
      try {
          req.session.destroy(err => {
              if (err) {
                  console.log("error destroying admin session", err)
              }
              res.redirect('/user/login')
          })
      } catch (error) {
          console.log("error during user logout", error)
      }
  }





module.exports={
   userlogin,validuser,
   usersignup,logout,
   adduser,verifyOTP,verifyOTPpost,
   showfoodDetail,
   forgotpassword,confirmpassword,emailverification,verify,verifypost,confirmPassword,
   profile,
   change,
   wallet,
   wishlist,
   cart,
   order,
   review,
   confirmorder,orderSuccess 
}