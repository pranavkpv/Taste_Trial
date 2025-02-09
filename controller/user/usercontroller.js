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
const walletSchema = require('../../model/walletSchema')
const mongoose = require('mongoose');
const Razorpay = require("razorpay");
const crypto = require("crypto");
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const orderschema = require('../../model/orderschema')
const locationSchema = require('../../model/locationSchema')




require("dotenv").config();
const razorpayInstance = new Razorpay({
   key_id: process.env.RAZORPAY_KEY_ID, // Securely loaded from the .env file
   key_secret: process.env.RAZORPAY_KEY_SECRET, // Securely loaded from the .env file
});




// userlogin check
const validuser = async (req, res) => {
   try {
      const { email, password } = req.body;
      const existUser = await userschema.findOne({ email, password, is_blocked: false })
      console.log(existUser)
      if (!email || email.trim() === "" ) {
         return res.json({ messageEmail: "Email is required"});
      }
      if( !password || password.trim() === ""){
         return res.json({ messagePassword: "Password is required" })
      }
     
      if (!existUser) {
         return res.json({ existMessage: "Email or Password is Wrong" });
      }
      else {
         return res.json({ successMessage: "Login SuccessFully" });
      }

   } catch (error) {
      console.error(error);
      res.status(500).json({ message: "An error occurred while processing your request." });
   }
};






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
      const { firstName, lastName, email,phonenumber, password, confirmPassword } = req.body;
      console.log(req.body)
      if (firstName ===""  || firstName.trim() ==="") {
         return res.json({ noFirst: "Firstname is required"});
      }
      if(!lastName || lastName.trim() === "" ){
         return res.json({noLast: "Lastname is required"})
      }
      if(!phonenumber || phonenumber.trim() === ""){
         return res.json({nophone: "PhoneNumber is required"})
      }

      if(!email || email.trim() === ""){
         return res.json({noemail: "Email is required"})
      }
      if(!password || password.trim() === ""){
         return res.json({nopassword: "Password is required"})
      }

      if(!confirmPassword || confirmPassword.trim() === ""){
         return res.json({noconfirm: "confirm password is required"})
      }
      if (password !== confirmPassword) {
         return res.json({nomatch: "Password is not match "})
      }
      const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&#^()\-_=+{}[\]<>])[A-Za-z\d@$!%*?&#^()\-_=+{}[\]<>]{8,}$/;
      if (!passwordRegex.test(password)) {
         return res.json({condition:"Password must include at least one uppercase letter, one lowercase letter, one number, one special character, and be at least 8 characters long."});
      }
      const numRegex = /^[0-9]{10}$/;
      if (!numRegex.test(phonenumber)) {
         return res.json({conditionPhone:"Must enter valid phonenumber"})
      }
      const existuser = await userschema.findOne({ email });

      if (existuser) {
         if (existuser.is_blocked === true) {
            return res.json({exist:"The user is blocked"});
         } else {
            return res.json({exit: "User already exists"});
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
         firstname:firstName,
         lastname:lastName,
         phonenumber,
         password,
         Otp
      }
      console.log(req.session.userData)
      res.json({ redirect: "/user/verifyOTP" });
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
      const { otp } = req.body;
      if(!otp && otp.trim()===""){
         return res.json({error:"please enter OTP"})
      }
      if (req.session.userData.Otp == otp) {   
         const newUser = new userschema({
            firstname: req.session.userData.firstname,
            lastname: req.session.userData.lastname,
            phonenumber: req.session.userData.phonenumber,
            email: req.session.userData.email,
            password: req.session.userData.password,
         });
   
         await newUser.save();
          res.json({successmessage:"User Created SuccessFully"}) 
         
      }else{
         return res.json({error:"Otp is wrong"});
      }
   

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
      const { newpassword, confirmpassword } = req.body
      const userEmail = req.session.userData.email

      console.log(req.body)
      if (newpassword == confirmpassword) {
         console.log("Hello")
         await userschema.updateOne({ email: userEmail }, { password: newpassword })
         return res.json({ success: "SuccessFully Changed the message" })


      } else {
         console.log("Hai")
         return res.json({ nomatch: "Password is not match" })
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

      const orderId=req.query.orderId
      console.log(req.query)
      const userid = req.session.user
      const cartIds = req.query.cartIDS.split(',')
      const quantity = req.query.purchaseQty.split(',')
      for (let i = 0; i < cartIds.length; i++) {
         await cartschema.findByIdAndUpdate({ _id: cartIds[i] }, { number: quantity[i] })
      }
      cartIds.forEach(element => new ObjectId(element));
      const addressess = await addressschema.aggregate([{$match:{ user_id: new ObjectId(userid) }},{
         $lookup:{
            from :"locations",
            localField:"location_id",
            foreignField:"_id",
            as:"locationDetails"
         }
      }])
      const Addresserror = req.flash('Addresserror')
      const successmessage = req.flash('success')
      const couponsuccessmessage = req.flash('couponsuccess')
      const errormessage = req.flash('error')
      const couponCode = req.flash('couponCode')
      const failedMessage = req.flash('failed')
      const couponCodestr = couponCode.toString()
      const coupons = await couponschema.findOne({ couponCode: couponCode })
      const users = await userschema.findOne({ _id: userid })
      const removeSuccess = req.flash('removeSuccess')
      const orders=await orderSchema.find({user_id:userid})
      const x = orders.map((element)=>element.couponId)
  
      const availCoupon=await couponschema.find({_id:{$nin:x}})
      const availCoupons=availCoupon.map((element)=>{
         const day=element.expiryDate.getDate()
         const month=element.expiryDate.getMonth()+1
         const year=element.expiryDate.getFullYear()
         return { ...element, expiryDates: `${day}-${month}-${year}` };
      })

      const datas = await cartschema.aggregate([{ $match: { user_id: new ObjectId(userid), _id: { $in: cartIds.map(id => new ObjectId(id)) } } },
      { $lookup: { from: "rates", localField: "rate_id", foreignField: "_id", as: "rateDetails" } },
      { $unwind: { path: "$rateDetails", preserveNullAndEmptyArrays: true } },
      { $lookup: { from: "foods", localField: "rateDetails.food_id", foreignField: "_id", as: "foodDetails" } },
      { $lookup: { from: "hotels", localField: "rateDetails.hotel_id", foreignField: "_id", as: "hotelDetails" } },
      { $lookup: { from: "varients", localField: "rateDetails.varient_id", foreignField: "_id", as: "varientDetails" } },
      { $lookup: { from: "categories", localField: "foodDetails.category_id", foreignField: "_id", as: "categoryDetails" } }
      ])
      res.render('user/confirmorder', {Addresserror,orderId,availCoupon,failedMessage,availCoupons, removeSuccess, coupons, couponCode, couponCodestr, users, userid, errormessage, cartIds, couponsuccessmessage, addressess, datas, successmessage, searchmessage: "", searcheditemname: "" });

   } catch (error) {
      console.log(error)
   }
}







const orderSuccess = async (req, res) => {
   try {
      const { orderId,addressSelect, cartId, numberofproduct, selectedPaymentMethod, couponId } = req.body;
      if (!addressSelect && addressSelect=="") {
         
         req.flash("Addresserror", "Must Add Address");
         return res.redirect(`/user/confirmorder?cartIDS=${ cartId }&purchaseQty=${ numberofproduct }`)
      }
      console.log(req.body)
    

      const userId = req.session.user;

      const addresses=await addressschema.aggregate([{$match:{_id:new ObjectId(addressSelect)}},{
         $lookup:{
            from:"locations",
            localField:"location_id",
            foreignField:"_id",
            as:"locationDetails"
         }
      }])
      console.log(addresses)

      if(orderId && selectedPaymentMethod=="COD"){
         await orderschema.findByIdAndUpdate({_id:orderId},{
            paymentmethod:selectedPaymentMethod,
            paidStatus:"pending",
            address_id:addressSelect
         })
         req.flash("success", "Order Placed Successfully");
         return res.redirect(`/user/confirmorder?cartIDS=${ cartId }&purchaseQty=${ numberofproduct }`);

      }
      if(orderId && selectedPaymentMethod=="razorpay"){
         await orderschema.findByIdAndUpdate({_id:orderId},{
            paymentmethod:selectedPaymentMethod,
            paidStatus:"completed",
            address_id:addressSelect
         })
         req.flash("success", "Order Placed Successfully");
         return res.redirect(`/user/confirmorder?cartIDS=${ cartId }&purchaseQty=${ numberofproduct }`);
      }

      if(orderId && selectedPaymentMethod=="wallet"){
         await orderschema.findByIdAndUpdate({_id:orderId},{
            paymentmethod:selectedPaymentMethod,
            paidStatus:"completed",
            address_id:addressSelect
         })
         req.flash("success", "Order Placed Successfully");
         return res.redirect(`/user/confirmorder?cartIDS=${ cartId }&purchaseQty=${ numberofproduct }`);
      }
      if(orderId && selectedPaymentMethod=="failedRazorpay"){
         await orderschema.findByIdAndUpdate({_id:orderId},{
            paymentmethod:selectedPaymentMethod,
            paidStatus:"failed",
            address_id:addressSelect
         })
         req.flash("success", "Order Placed Successfully");
         return res.redirect(`/user/confirmorder?cartIDS=${ cartId }&purchaseQty=${ numberofproduct }`);
      }
  
   
   

      const cartIds = Array.isArray(cartId)
         ? cartId.map((item) => new ObjectId(item))
         : [new ObjectId(cartId)];

      const carts = await cartschema.aggregate([
         { $match: { _id: { $in: cartIds } } },
         { $lookup: { from: "rates", localField: "rate_id", foreignField: "_id", as: "rateDetails" } },
      ]);

 

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
               offer_per: Math.max(food.offer, category.offer),
            };
         })
      );

      const totalAmount = items.reduce((sum, item) => {
         const itemTotal =
            item.quantity *
            (item.rate +
               item.rate * (item.gst_per / 100) +
               item.rate * (item.packing_per / 100) );
         return sum + itemTotal;
      }, 0);

      const totalOffer = items.reduce((sum, item) => {
         return sum + item.quantity * item.rate * (item.offer_per / 100);
      }, 0);
      const couponsdata=await couponschema.findOne({_id:couponId})
      
      if(selectedPaymentMethod =="COD" && totalAmount-totalOffer>1000){
         req.flash('error',"Above 100 Rs Cach On Delivery is not Possible")
         return res.redirect(`/user/confirmorder?cartIDS=${ cartId }&purchaseQty=${ numberofproduct }`)
      }
   
      const newOrder = new orderSchema({
         user_id: userId,
         address_id:addressSelect ,
         paymentmethod: selectedPaymentMethod,
         deliveryAmount:addresses[0].locationDetails[0].deliveryCharge,
         totalAmount,
         totalOffer,
         couponId,
         items
      });
     
      const wallets = await walletSchema.find({})
      const sumofcredit = wallets.reduce((sum, element) => {
         if (element.type == "Credit") {
            sum += element.amount
         }
         return sum
      }, 0)
      const sumofDebit = wallets.reduce((sum, element) => {
         if (element.type === "Debit") {
            sum += element.amount
         }
         return sum
      }, 0)
      const totalBalanceAmount = sumofcredit - sumofDebit
      if (selectedPaymentMethod == "wallet") {
    
         if (totalAmount - totalOffer > totalBalanceAmount) {
            req.flash('error', `Available Balalnce is ${ totalBalanceAmount }`)
            return res.redirect(`/user/confirmorder?cartIDS=${ cartId }&purchaseQty=${ numberofproduct }`);

         } else {
       
            const newWallet = new walletSchema({
               desription: "Order Payment",
               type: "Debit",
               amount: totalAmount - totalOffer,
               userId: userId
            })
            await newWallet.save()
            const newOrders=new orderSchema({
               user_id: userId,
               address_id: addressSelect,
               paymentmethod: selectedPaymentMethod,
               deliveryAmount:addresses[0].locationDetails[0].deliveryCharge,
               totalAmount,
               totalOffer,
               couponId,
               items,
               paidStatus:"completed"
            });
            await newOrders.save()
            await cartschema.deleteMany({ _id: { $in: cartIds } });

            const stockUpdates = items.map((item, index) => ({
               updateOne: {
                  filter: { _id: item.rate_id },
                  update: { $inc: { stock: -numberofproduct[index] } },
               },
            }));

            await rateschema.bulkWrite(stockUpdates);

            req.flash("success", "Order Placed Successfully");
            return res.redirect(`/user/confirmorder?cartIDS=${ cartId }&purchaseQty=${ numberofproduct }`);

         }

      } else if(selectedPaymentMethod=="razorpay") {
         const newOrders=new orderSchema({
            user_id: userId,
            address_id: addressSelect,
            paymentmethod: selectedPaymentMethod,
            deliveryAmount:addresses[0].locationDetails[0].deliveryCharge,
            totalAmount,
            totalOffer,
            couponId,
            items,
            paidStatus:"completed"
         });
         await newOrders.save()
         await cartschema.deleteMany({ _id: { $in: cartIds } });

         const stockUpdates = items.map((item, index) => ({
            updateOne: {
               filter: { _id: item.rate_id },
               update: { $inc: { stock: -numberofproduct[index] } },
            },
         }));
         const address=await addressschema.findOne({_id:addressSelect})
         const location = await locationSchema.findOne({_id:address.location_id})
         const deliveryCharge=location.deliveryCharge
         await rateschema.bulkWrite(stockUpdates);

         req.flash("success", `Order Placed Successfully Your DeliveryCharge Extra Added is ${deliveryCharge}`);
         return res.redirect(`/user/confirmorder?cartIDS=${ cartId }&purchaseQty=${ numberofproduct }`);

      }else if(selectedPaymentMethod=="failedRazorpay"){
         const newOrders=new orderSchema({
            user_id: userId,
            address_id: addressSelect,
            paymentmethod: selectedPaymentMethod,
            deliveryAmount:addresses[0].locationDetails[0].deliveryCharge,
            totalAmount,
            totalOffer,
            couponId,
            items,
            paidStatus:"failed"
         });
         await newOrders.save()
         req.flash("failed", "Create The order with Failed Status");
         return res.redirect(`/user/confirmorder?cartIDS=${ cartId }&purchaseQty=${ numberofproduct }`);

      }else{
         await newOrder.save();
         await cartschema.deleteMany({ _id: { $in: cartIds } });

         const stockUpdates = items.map((item, index) => ({
            updateOne: {
               filter: { _id: item.rate_id },
               update: { $inc: { stock: -numberofproduct[index] } },
            },
         }));

         await rateschema.bulkWrite(stockUpdates);
         const address=await addressschema.findOne({_id:addressSelect})
         const location = await locationSchema.findOne({_id:address.location_id})
         const deliveryCharge=location.deliveryCharge
         await rateschema.bulkWrite(stockUpdates);

         req.flash("success", `Order Placed Successfully Your DeliveryCharge Extra Added is ${deliveryCharge}`);
         return res.redirect(`/user/confirmorder?cartIDS=${ cartId }&purchaseQty=${ numberofproduct }`);

      }

   } catch (error) {
      console.error("Error in orderSuccess:", error);
      req.flash("error", "An error occurred while placing the order.");
      return res.redirect("/user/cart");
   }
};






// Custom fonts and colors
const COLORS = {
    primary: '#2563eb',    // Blue
    secondary: '#475569',  // Slate
    accent: '#f97316',     // Orange
    text: '#1e293b',      // Dark slate
    lightGray: '#e2e8f0',
    white: '#ffffff'
};

const downloadBill = async (req, res) => {
    try {
        const orderId = req.query.orderId;
        if (!orderId) {
            return res.status(400).json({ error: "Order ID is required" });
        }

        // Fetch order details with aggregation
        const orders = await orderSchema.aggregate([
            { $match: { _id: new ObjectId(orderId) } },
            { $unwind: { path: "$items", preserveNullAndEmptyArrays: true } },
            { 
                $lookup: {
                    from: "rates",
                    localField: "items.rate_id",
                    foreignField: "_id",
                    as: "rateDetails"
                }
            },
            { 
                $lookup: {
                    from: "foods",
                    localField: "rateDetails.food_id",
                    foreignField: "_id",
                    as: "foodDetails"
                }
            },
            { 
                $lookup: {
                    from: "users",
                    localField: "user_id",
                    foreignField: "_id",
                    as: "userDetails"
                }
            },
            {
                $lookup: {
                    from: "hotels",
                    localField: "rateDetails.hotel_id",
                    foreignField: "_id",
                    as: "hotelDetails"
                }
            }
        ]);

        if (!orders || orders.length === 0) {
            return res.status(404).json({ error: "Order not found" });
        }

  
        const calculateCharges = (orders) => {
            return {
                gst: orders.reduce((sum, element) => 
                    sum += (element.items.quantity * element.items.rate * element.items.gst_per / 100), 0),
                packingCharge: orders.reduce((sum, element) => 
                    sum += (element.items.quantity * element.items.rate * element.items.packing_per / 100), 0),
                deliveryCharge: orders.reduce((sum, element) => 
                    sum += element.deliveryAmount, 0),
                TotalOffer :orders.reduce((sum,element)=>
                  sum += element.totalOffer,0)

            };
        };

        // Generate PDF with enhanced design
        const generatePDF = async (orders, charges) => {
            const order = orders[0];
            const invoicePath = path.join(__dirname, `../invoices/invoice-${orderId}.pdf`);
            const doc = new PDFDocument({ margin: 50 });
            const stream = fs.createWriteStream(invoicePath);

            return new Promise((resolve, reject) => {
                doc.pipe(stream);

                // Helper function to draw background rectangles
                const drawRect = (x, y, w, h, color) => {
                    doc.rect(x, y, w, h)
                       .fill(color);
                };

                // Header Background
                drawRect(0, 0, doc.page.width, 150, COLORS.primary);

                // Logo and Company Name
                doc.fontSize(30)
                   .fillColor(COLORS.white)
                   .text('Taste Trial', 50, 50, { align: 'center' })
                   .fontSize(12)
                   .text('Delicious Food Delivered', 50, 90, { align: 'center' });

                // Order Information Box
                drawRect(50, 170, doc.page.width - 100, 100, COLORS.lightGray);
                doc.fontSize(12)
                   .fillColor(COLORS.text)
                   .text('INVOICE DETAILS', 70, 185)
                   .fontSize(10)
                   .text(`Order ID: ${order._id}`, 70, 210)
                   .text(`Date: ${new Date(order.createdAt).toLocaleString()}`, 70, 230)
                   .fontSize(12)
                   .text('CUSTOMER DETAILS', doc.page.width - 250, 185)
                   .fontSize(10)
                   .text(`${order.userDetails[0].firstname} ${order.userDetails[0].lastname}`, 
                         doc.page.width - 250, 210);

                // Table Header
                const drawTableHeader = () => {
                    const y = 300;
                    drawRect(50, y, doc.page.width - 100, 30, COLORS.primary);
                    doc.fillColor(COLORS.white)
                       .fontSize(10);

                    const columns = [
                        { x: 60, width: 30, text: "No." },
                        { x: 100, width: 120, text: "Hotel" },
                        { x: 230, width: 120, text: "Item" },
                        { x: 360, width: 50, text: "Qty" },
                        { x: 420, width: 70, text: "Rate" },
                        { x: 500, width: 70, text: "Total" }
                    ];

                    columns.forEach(col => {
                        doc.text(col.text, col.x, y + 10, { 
                            width: col.width, 
                            align: col.text === "No." ? "center" : "left" 
                        });
                    });
                };

                drawTableHeader();

                // Items
                let y = 340;
                orders.forEach((item, index) => {
                    const food = item.foodDetails[0];
                    const rate = item.rateDetails[0];
                    const hotel = item.hotelDetails[0];
                    const itemTotal = rate.rate * item.items.quantity;

                    // Alternate row background
                    if (index % 2 === 0) {
                        drawRect(50, y - 5, doc.page.width - 100, 25, '#f8fafc');
                    }

                    doc.fillColor(COLORS.text)
                       .fontSize(9)
                       .text(`${index + 1}`, 60, y, { width: 30, align: 'center' })
                       .text(hotel.hotelname, 100, y, { width: 120 })
                       .text(food.foodname, 230, y, { width: 120 })
                       .text(item.items.quantity.toString(), 360, y, { width: 50 })
                       .text(`${rate.rate}`, 420, y, { width: 70 })
                       .text(`${itemTotal}`, 500, y, { width: 70 });

                    y += 25;
                });


                // Summary Box
                const summaryY = y + 20;
                drawRect(doc.page.width - 250, summaryY, 200, 150, COLORS.lightGray);
                
                const { gst, packingCharge, deliveryCharge,TotalOffer } = charges;
                const totalAmount = orders.reduce((sum,element)=>{
                  return sum+=element.items.rate*element.items.quantity
                },0) ;
                const grandTotal = totalAmount + packingCharge + deliveryCharge + gst - TotalOffer;

                // Summary Details
                doc.fontSize(10)
                   .fillColor(COLORS.text)
                   .text('Order Summary', doc.page.width - 230, summaryY + 10)
                   .fontSize(9)
                   .text('Subtotal:', doc.page.width - 230, summaryY + 35)
                   .text(`${totalAmount}`, doc.page.width - 90, summaryY + 35)
                   .text('Packing Charge:', doc.page.width - 230, summaryY + 55)
                   .text(`${packingCharge}`, doc.page.width - 90, summaryY + 55)
                   .text('Delivery Charge:', doc.page.width - 230, summaryY + 75)
                   .text(`${deliveryCharge}`, doc.page.width - 90, summaryY + 75)
                   .text('GST :', doc.page.width - 230, summaryY + 95)
                   .text(`${gst}`, doc.page.width - 90, summaryY + 95)
                   .text('Offer :', doc.page.width - 230, summaryY + 115)
                   .text(`${TotalOffer}`, doc.page.width - 90, summaryY + 115);


                // Grand Total
                drawRect(doc.page.width - 250, summaryY + 135, 200, 30, COLORS.primary);
                doc.fontSize(12)
                   .fillColor(COLORS.white)
                   .text('Grand Total:', doc.page.width - 210, summaryY + 150)
                   .text(`${grandTotal.toFixed(2)}`, doc.page.width - 90, summaryY + 150);

                // Footer
                const footerY = doc.page.height - 100;
                drawRect(0, footerY, doc.page.width, 100, COLORS.secondary);
                doc.fontSize(10)
                   .fillColor(COLORS.white)
                   .text('Thank you for your order!', 50, footerY + 30, { align: 'center' })
                   .fontSize(8)
                   .text('For any issues, contact support@tastetrial.com | +91 1234567890', 50, footerY + 50, { align: 'center' })
                   .text('© 2024 Taste Trial. All rights reserved.', 50, footerY + 65, { align: 'center' });

                doc.end();
                stream.on("finish", () => resolve(invoicePath));
                stream.on("error", reject);
            });
        };

        // Execute PDF generation and send
        const charges = calculateCharges(orders);
        const invoicePath = await generatePDF(orders, charges);

        res.download(invoicePath, `invoice-${orderId}.pdf`, (err) => {
            if (err) {
                console.error("Download error:", err);
                return res.status(500).json({ error: "Error downloading the invoice" });
            }
            // Cleanup: Remove the file after sending
            fs.unlink(invoicePath, (unlinkErr) => {
                if (unlinkErr) console.error("Error removing temporary file:", unlinkErr);
            });
        });

    } catch (error) {
        console.error("Invoice generation error:", error);
        res.status(500).json({ 
            error: "Failed to generate invoice",
            details: error.message 
        });
    }
};





// coupon
const applyCoupon = async (req, res) => {
   try {
      const { couponCode, cartIDS, purchaseQty } = req.body
      const userId = req.session.user
      console.log(req.body)
      console.log(userId)
      const existCoupon = await couponschema.findOne({ couponCode: couponCode })
      const orderss = await orderSchema.find({})
      if (!existCoupon) {
         console.log("not exist")
         req.flash('error', "You Entered coupon is not available")
         return res.redirect(`/user/confirmorder?cartIDS=${ cartIDS }&purchaseQty=${ purchaseQty }`)
      } 
        const orders = await orderSchema.findOne({ user_id: new ObjectId(userId), couponId: existCoupon._id })
         if (orders) {
         req.flash('error', "Coupon is Already Used")
         return res.redirect(`/user/confirmorder?cartIDS=${ cartIDS }&purchaseQty=${ purchaseQty }`)
      }
         req.flash('couponCode', couponCode)
         req.flash('couponsuccess', "coupon applied successfully")
         res.redirect(`/user/confirmorder?cartIDS=${ cartIDS }&purchaseQty=${ purchaseQty }`)

      

   } catch (error) {
      console.log(error)
   }
}

const removeCoupon = async (req, res) => {
   try {
      const { removecouponId, cartId, numberofproduct } = req.body
      const coupons = await couponschema.findOne({ _id: removecouponId })
      req.flash('success', "Coupon Removed Successfull")
      res.redirect(`/user/confirmorder?cartIDS=${ cartId }&purchaseQty=${ numberofproduct }`)
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






const logout = async (req, res) => {
   try {
      req.session.destroy(err => {
         if (err) {
            console.log("error destroying admin session", err)
         }
         res.redirect('/user/load')
      })
   } catch (error) {
      console.log("error during user logout", error)
   }
}





module.exports = {
   validuser,
   usersignup, logout,
   adduser, verifyOTP, verifyOTPpost, resendOTP,
   showfoodDetail,
   forgotpassword, confirmpassword, emailverification, verify, verifypost, confirmPassword, resend,
   profile,downloadBill,
   wallet,
   review,
   confirmorder, orderSuccess,
   applyCoupon, removeCoupon
}