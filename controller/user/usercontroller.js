const userschema = require('../../model/usershema')
const categoryschema = require('../../model/categoryschema')
const bannerschema = require('../../model/bannerschema')
const foodschema = require('../../model/foodschema')
const hotelschema = require('../../model/hotelschema')
const nodemailer = require('nodemailer')
const addressschema = require('../../model/addressschema')
const orderSchema = require("../../model/orderschema")
const rateschema = require("../../model/rateschema")
const env = require("dotenv").config()
const { ObjectId } = require('mongodb');
const cartschema = require('../../model/cartschema')
const couponschema = require('../../model/couponschema')
const mongoose = require('mongoose');
const Razorpay = require("razorpay");
const crypto = require("crypto");
require("dotenv").config();
const razorpayInstance = new Razorpay({
   key_id: process.env.RAZORPAY_KEY_ID, // Securely loaded from the .env file
   key_secret: process.env.RAZORPAY_KEY_SECRET, // Securely loaded from the .env file
});

// userlogin get
const userlogin = async (req, res) => {
   try {
      const notExistmessage = req.flash('exist')
      const nocontendmessage = req.flash('nocontend')
      const successmessage = req.flash('success')
      const errormessage = req.flash('error')
      res.render("user/login", { notExistmessage, nocontendmessage, successmessage, errormessage })
   } catch (error) {
      console.log(error)
      req.flash("error", "An Error Occured")
      res.redirect('/user/login')
   }
}

// userlogin check
const validuser = async (req, res) => {
   try {
      const { email, password } = req.body
      const existuser = await userschema.findOne({ email, password })
      if (!email || !password) {
         req.flash("nocontend", "Please fill username and password")
         res.redirect('/user/login')
      } else if (!existuser) {

         req.flash("exist", "Username or Password is Wrong")
         res.redirect('/user/login')

      } else if (existuser.is_blocked === true) {
         req.flash("exist", "User is block to access")
         res.redirect('/user/login')
      }
      else {
         const users = await userschema.findOne({ email: email })
         req.session.user = users._id
         req.flash("success", "Login SuccessFully")
         res.redirect("/user/home")
      }
   } catch (error) {
      console.log(error)
      req.flash("error", "An Error Occured")
      res.redirect('/user/login')
   }

}



// user signup
const usersignup = async (req, res) => {
   try {
      const exitusermessage = req.flash("exist")
      const nocondentmessage = req.flash("nocondent")
      const successsavemessage = req.flash("success")
      const errormessage = req.flash("error")

      res.render("user/signup", {
         exitusermessage, nocondentmessage, errormessage,
         successsavemessage
      })
   } catch (error) {
      console.log(error)
   }
}

function generateOTP() {
   return Math.floor(100000 + Math.random() * 900000).toString();
}


// signup
const adduser = async (req, res) => {
   try {
      const { firstname, lastname, phonenumber, email, password, confirmpassword } = req.body;
      if (firstname === "" || lastname === "" || phonenumber === "" || email === "" || password === "" || confirmpassword === "") {
         req.flash("nocondent", "Please fill all the fields");
         return res.redirect("/user/signup");
      }


      if (password !== confirmpassword) {
         req.flash("error", "Password does not match");
         return res.redirect("/user/signup");
      }
      const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&#^()\-_=+{}[\]<>])[A-Za-z\d@$!%*?&#^()\-_=+{}[\]<>]{8,}$/;
      if (!passwordRegex.test(password)) {
         req.flash("error", "Password must include at least one uppercase letter, one lowercase letter, one number, one special character, and be at least 8 characters long.");
         return res.redirect("/user/signup");
      }
      const numRegex = /^[0-9]{10}$/;
      if (!numRegex.test(phonenumber)) {
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
      req.session.userData = {
         email,
         firstname,
         lastname,
         phonenumber,
         password,
         Otp
      }

      res.redirect("/user/verifyOTP",);
   } catch (error) {
      console.log(error);
   }
};

async function sendverificationEmal(email, Otp) {
   try {
      const transporter = nodemailer.createTransport({
         service: 'gmail',
         port: 587,
         secure: false,
         requireTLS: true,
         auth: {
            user: process.env.NODEMAILER_EMAIL,
            pass: process.env.NODEMAILER_PASSWORD
         }
      })

      const info = await transporter.sendMail({
         from: process.env.NODEMAILER_EMAIL,
         to: email,
         subject: "verify your account",
         text: `Your OTP is ${ Otp }`,
         html: `<b> Your OTP :${ Otp }`
      })
      return info.accepted.length > 0
   } catch (error) {
      console.error("Error Sending Email", error)
      return false
   }
}


const verifyOTP = (req, res) => {
   try {
      const errormessage = req.flash('error')
      const successmessage = req.flash('success')
      res.render('user/verifyOTP', { errormessage, successmessage })
   } catch (error) {
      console.log(error)
   }
}



const verifyOTPpost = async (req, res) => {
   try {
      const { Otp } = req.body;
      console.log(req.session.userData);
      console.log(req.body);

      // Validate the OTP
      if (req.session.userData.Otp !== Otp) {
         req.flash('error', "Entered OTP is not Valid");
         return res.redirect('/user/verifyOTP');
      }

      // Create a new user
      const newUser = new userschema({
         firstname: req.session.userData.firstname,
         lastname: req.session.userData.lastname,
         phonenumber: req.session.userData.phonenumber,
         email: req.session.userData.email,
         password: req.session.userData.password,
      });

      await newUser.save();


      req.flash('success', "Successfully created the user");

      res.redirect('/user/login');

      // Destroy the session after response
      req.session.destroy((err) => {
         if (err) {
            console.error('Error destroying session:', err);
         }
      });

   } catch (error) {
      console.error('Error in OTP verification:', error);
      res.status(500).send("An error occurred. Please try again.");
   }
};


const resendOTP = async (req, res) => {
   try {
      console.log(req.session.userData)
      const email = req.session.userData.email
      const Otp = generateOTP();
      console.log("OTP generated: ", Otp); // Log OTP
      const emailSend = await sendverificationEmal(email, Otp);
      if (!emailSend) {
         req.flash("error", "OTP is not send");
         return res.redirect("/user/signup");
      }
      req.session.userData.Otp = Otp
      res.redirect("/user/verifyOTP",);
   } catch (error) {
      console.log(error)
   }
}

// home page

const showfoodDetail = async (req, res) => {
   try {
      const { foodid, hotelid, userid } = req.body
      const foods = await foodschema.find({ _id: foodid, is_blocked: false })
      const hotels = await hotelschema.find({ _id: hotelid })
      const users = await userschema.find({ _id: userid })
      res.render('user/productDetail', { foods, hotels, users })
   } catch (error) {

   }
}
const forgotpassword = async (req, res) => {
   try {
      const existmessage = req.flash('exist')
      const successmessage = req.flash('success')
      const errormessage = req.flash('error')
      res.render('user/emailverification', { existmessage, successmessage, errormessage })
   } catch (error) {
      console.log(error)
   }
}

const emailverification = async (req, res) => {
   try {
      const { email } = req.body
      const existuser = await userschema.findOne({ email })
      if (!existuser) {
         req.flash("exist", "User is not Exist");
         res.redirect("/user/emailverification");
      } else {
         const Otp = generateOTP();
         console.log("OTP generated: ", Otp); // Log OTP
         const emailSend = await sendverificationEmal(email, Otp);
         if (!emailSend) {
            req.flash("error", "OTP is not send");
            return res.redirect("/user/forgotpassword");
         } else {
            req.session.userData = {
               Otp: Otp,
               email: email
            }
            console.log(req.session.userData)
            res.redirect('/user/verify')
         }
      }

   } catch (error) {
      console.log(error)
   }
}


const resend = async (req, res) => {
   try {
      console.log(req.session.userData)
      const Otp = generateOTP();
      console.log("OTP generated: ", Otp); // Log OTP
      const emailSend = await sendverificationEmal(req.session.userData.email, Otp);
      if (!emailSend) {
         req.flash("error", "OTP is not send");
         return res.redirect("/user/forgotpassword");
      }
      req.session.userData.Otp = Otp
      res.redirect('/user/verify')
   } catch (error) {
      console.log(error)
   }
}

const verify = async (req, res) => {
   try {
      const errormessage = req.flash('error')
      const successmessage = req.flash('success')
      res.render('user/verify', { errormessage, successmessage })
   } catch (error) {
      console.log(error)
   }
}
const verifypost = async (req, res) => {
   try {
      console.log(req.body)
      console.log(req.session.userData)
      if (req.body.Otp !== req.session.userData.Otp) {
         req.flash('error', "Entered OTP is wrong try again")
         res.redirect('/user/verify')
      } else {
         req.flash('success', "Change Password")
         res.redirect('/user/confirmpassword')
      }

   } catch (error) {
      console.log(error)
   }
}







const confirmpassword = async (req, res) => {
   try {
      const errormessage = req.flash('error')
      res.render('user/confirmpassword', { errormessage })
   } catch (error) {

   }
}

const confirmPassword = async (req, res) => {
   try {

      const { password, confirmpassword } = req.body
      if (password !== confirmpassword) {
         req.flash('error', "Invalid Pssword")
         res.redirect('/user/confirmpassword')
      } else {
         console.log(req.session.userData)
         await userschema.updateOne({ email: req.session.userData.email }, { password: password })
         req.flash('success', "Password Changed Successfully");
         res.redirect('/user/login');

         req.session.destroy((err) => {
            if (err) {
               console.error('Error destroying session:', err);
               return res.status(500).send("An error occurred. Please try again.");
            }
         });
      }


   } catch (error) {
      console.log(error)
   }
}

// profile

const profile = (req, res) => {
   try {
      res.render('user/profile')
   } catch (error) {

   }
}

//review

const review = (req, res) => {
   try {
      res.render('user/review')
   } catch (error) {

   }
}




const confirmorder = async (req, res) => {
   try {
      const userid = req.session.user
      const cartIds = req.query.cartIDS.split(',')
      const quantity = req.query.purchaseQty.split(',')
      for (let i = 0; i < cartIds.length; i++) {
         await cartschema.findByIdAndUpdate({ _id: cartIds[i] }, { number: quantity[i] })
      }
      cartIds.forEach(element => new ObjectId(element));
      const addressess = await addressschema.find({ user_id: userid })
      const successmessage = req.flash('success')
      const couponsuccessmessage = req.flash('couponsuccess')
      const errormessage = req.flash('error')
      const couponCode = req.flash('couponCode')
      const coupons = await couponschema.findOne({ couponCode: couponCode })
      const datas = await cartschema.aggregate([{ $match: { user_id: new ObjectId(userid), _id: { $in: cartIds.map(id => new ObjectId(id)) } } },
      { $lookup: { from: "rates", localField: "rate_id", foreignField: "_id", as: "rateDetails" } },
      { $unwind: { path: "$rateDetails", preserveNullAndEmptyArrays: true /* Use this if some cart items might not have matching rates*/ } },
      { $lookup: { from: "foods", localField: "rateDetails.food_id", foreignField: "_id", as: "foodDetails" } },
      { $lookup: { from: "hotels", localField: "rateDetails.hotel_id", foreignField: "_id", as: "hotelDetails" } },
      { $lookup: { from: "varients", localField: "rateDetails.varient_id", foreignField: "_id", as: "varientDetails" } },
      { $lookup: { from: "categories", localField: "foodDetails.category_id", foreignField: "_id", as: "categoryDetails" } }
      ])
      res.render('user/confirmorder', { coupons, userid, errormessage, cartIds, couponsuccessmessage, addressess, datas, successmessage, searchmessage: "", searcheditemname: "" });

   } catch (error) {
      console.log(error)
   }
}


const orderSuccess = async (req, res) => {
   try {
      const { addressId, cartId, numberofproduct, selectedPaymentMethod, couponId } = req.body;
      const userId = req.session.user;

      if (!addressId) {
         req.flash("error", "Must Add Address");
         return res.redirect("/user/address");
      }

      const cartIds = Array.isArray(cartId)
         ? cartId.map((item) => new ObjectId(item))
         : [new ObjectId(cartId)];

      const carts = await cartschema.aggregate([
         { $match: { _id: { $in: cartIds } } },
         { $lookup: { from: "rates", localField: "rate_id", foreignField: "_id", as: "rateDetails" } },
      ]);

      if (!carts || carts.length === 0) {
         req.flash("error", "No cart items found.");
         return res.redirect("/user/cart");
      }

      const items = await Promise.all(
         carts.map(async (cart) => {
            if (!cart.rateDetails || cart.rateDetails.length === 0) {
               throw new Error(`Rate details not found for cart item with ID: ${ cart._id }`);
            }
            const foodId = cart.rateDetails[0].food_id;
            const food = await foodschema.findOne({ _id: foodId });
            if (!food) throw new Error(`Food not found for ID: ${ foodId }`);

            const category = await categoryschema.findOne({ _id: food.category_id });
            if (!category) throw new Error(`Category not found for ID: ${ food.category_id }`);

            return {
               rate_id: cart.rateDetails[0]._id,
               quantity: cart.number,
               rate: cart.rateDetails[0].rate,
               gst_per: cart.rateDetails[0].gst_per,
               packing_per: cart.rateDetails[0].packing_per,
               delivery_per: cart.rateDetails[0].delivery_per,
               offer_per: Math.max(food.offer, category.offer),
            };
         })
      );

      const totalAmount = items.reduce((sum, item) => {
         const itemTotal =
            item.quantity *
            (item.rate +
               item.rate * (item.gst_per / 100) +
               item.rate * (item.packing_per / 100) +
               item.rate * (item.delivery_per / 100));
         return sum + itemTotal;
      }, 0);

      const totalOffer = items.reduce((sum, item) => {
         return sum + item.quantity * item.rate * (item.offer_per / 100);
      }, 0);

      // if (selectedPaymentMethod === "razorpay") {
      //    // Create Razorpay Order
      //    const razorpayOrder = await razorpayInstance.orders.create({
      //       amount: Math.round(totalAmount * 100), // Amount in paisa
      //       currency: "INR",
      //       receipt: `receipt_${ Date.now() }`,
      //    });

      //    if (!razorpayOrder) {
      //       throw new Error("Failed to create Razorpay order.");
      //    }

      //    // Store order in DB (Optional)
      //    const newOrder = new orderSchema({
      //       user_id: userId,
      //       address_id: addressId,
      //       paymentmethod: selectedPaymentMethod,
      //       totalAmount,
      //       totalOffer,
      //       couponId,
      //       items,
      //       razorpay_order_id: razorpayOrder.id,
      //       status: "Pending",
      //    });

      //    await newOrder.save();

      //    // Send Razorpay Order Details to the Client
      //    return res.json({
      //       success: true,
      //       razorpayOrderId: razorpayOrder.id,
      //       amount: totalAmount,
      //       currency: "INR",
      //    });
      // }

      // Cash on Delivery (COD) Logic
      const newOrder = new orderSchema({
         user_id: userId,
         address_id: addressId,
         paymentmethod: selectedPaymentMethod,
         totalAmount,
         totalOffer,
         couponId,
         items,
      });

      await newOrder.save();
      await cartschema.deleteMany({ _id: { $in: cartIds } });

      const stockUpdates = items.map((item, index) => ({
         updateOne: {
            filter: { _id: item.rate_id },
            update: { $inc: { stock: -numberofproduct[index] } },
         },
      }));

      await rateschema.bulkWrite(stockUpdates);

      req.flash("success", "Order Placed Successfully");
      return res.redirect("/user/cart");
   } catch (error) {
      console.error("Error in orderSuccess:", error);
      req.flash("error", "An error occurred while placing the order.");
      return res.redirect("/user/cart");
   }
};




// coupon
const applyCoupon = async (req, res) => {
   try {
      const { couponCode, cartIDS, purchaseQty } = req.body
      const userId = req.session.user
      const coupons = await couponschema.findOne({ couponCode })
      const existCoupon = await couponschema.findOne({ couponCode: couponCode })
      const orderss = await orderSchema.find({})
      const orders = await orderSchema.findOne({ user_id: new ObjectId(userId), couponId: coupons._id })
      if (!existCoupon) {
         req.flash('error', "You Entered coupon is not available")
         res.redirect(`/user/confirmorder?cartIDS=${ cartIDS }&purchaseQty=${ purchaseQty }`)
      } else if (orders) {
         req.flash('error', "Coupon is Already Used")
         res.redirect(`/user/confirmorder?cartIDS=${ cartIDS }&purchaseQty=${ purchaseQty }`)
      } else {
         req.flash('couponCode', couponCode)
         req.flash('couponsuccess', "Coupon Applied SuccessFully")
         res.redirect(`/user/confirmorder?cartIDS=${ cartIDS }&purchaseQty=${ purchaseQty }`)
      }

   } catch (error) {
      console.log(error)
   }
}


//wallet
const wallet = (req, res) => {
   try {
      res.render('user/wallet')
   } catch (error) {

   }
}

//changeaccount
const change = async (req, res) => {
   try {
      const userid = req.session.user
      const successmessage = req.flash('success')
      const currentPassword = req.flash('currentPassword')
      const newPassword = req.flash('newPassword')
      res.render('user/changePassword', { userid, searchmessage: "", searcheditemname: "", successmessage, currentPassword, newPassword })
   } catch (error) {
      console.log(error)
   }
}
const changepassword = async (req, res) => {
   try {
      const { currentPassword, newPassword, confirmPassword } = req.body
      const userid = req.session.user
      req.flash('success', "User Password Changed SucessFully")
      res.redirect('/user/changePassword')

   } catch (error) {
      console.log(error)
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





module.exports = {
   userlogin, validuser,
   usersignup, logout,
   adduser, verifyOTP, verifyOTPpost, resendOTP,
   showfoodDetail,
   forgotpassword, confirmpassword, emailverification, verify, verifypost, confirmPassword, resend,
   profile,
   change,
   wallet,
   review,
   confirmorder, orderSuccess, changepassword,
   applyCoupon
}