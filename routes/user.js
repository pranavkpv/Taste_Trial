const express=require('express')
const router=express.Router()
const usercontroller=require("../controller/user/usercontroller")
const userauth = require("../middleware/userauth")
const passport = require('passport');
const loadcontroller = require('../controller/user/loadcontroller')
const homecontroller = require('../controller/user/homecontroller')
const productcontroller=require('../controller/user/productcontroller')
const userhotelcontroller=require('../controller/user/userhotelcontroller')
const uservarientcontroller=require('../controller/user/uservarientcontroller')
const userproductDetailController=require('../controller/user/userproductDetail')
const profilecontroller=require("../controller/user/profilecontroller")
const categorycontroller=require("../controller/user/categorycontroller")
const cartcontroller=require("../controller/user/cartcontroller")
const wishlistcontroller=require("../controller/user/wishlistcontroller")
const walletcontroller = require("../controller/user/walletController")
const changePasswordController = require("../controller/user/changePassword")
const failedController = require("../controller/user/failedOrder")


// Route to start the Google OAuth login
router.get('/auth/google', passport.authenticate('google', {
   scope: ['profile', 'email']
 }));
 
 // Google callback route to handle the redirect
router.get('/load',loadcontroller.userload)
//signup 
router.get('/signup',usercontroller.usersignup)
router.post('/verifyOTP',usercontroller.adduser)
router.post('/resendOTP',usercontroller.resendOTP)
//login
router.post('/login',usercontroller.validuser)

// verifyOTP
router.get('/verifyOTP',usercontroller.verifyOTP)
router.post('/confirmOTP',usercontroller.verifyOTPpost)
router.post('/resend',usercontroller.resend)


// userhome router
router.get('/home',homecontroller.home)

// user category list
router.get('/category',categorycontroller.category)

//food
router.get('/product',productcontroller.product)
//get hotel
router.get('/hotels',userhotelcontroller.hotel)
//varient get
router.get('/varient',uservarientcontroller.varient)

// forgot password
router.get('/emailverification',usercontroller.forgotpassword)
router.post('/emailverification',usercontroller.emailverification)

//verify
router.get('/verify',usercontroller.verify)
router.post('/verifypost',usercontroller.verifypost)

//vonfirm password
router.get('/confirmpassword',usercontroller.confirmpassword)
router.post('/confirmPassword',usercontroller.confirmPassword)
//profile
router.get('/dashboard',userauth.noUser,profilecontroller.dashboard)

// review
router.get('/review',usercontroller.review)

//address
router.get('/address',userauth.noUser,profilecontroller.address)
router.post('/addAddress',profilecontroller.addAddress)
router.post('/editAddress',profilecontroller.editAddress)
router.post('/deleteAddress',profilecontroller.deleteAddress)

//AddTocart
router.post('/productcart',userauth.noUser,userproductDetailController.productcart)


//cart
router.get('/cart',userauth.noUser,cartcontroller.cart)
router.post('/removeCart',cartcontroller.removeCart)

//wishlist
router.get('/wishlist',userauth.noUser,wishlistcontroller.wishlist)
router.post('/addToWishlist',userauth.noUser,wishlistcontroller.addToWishlist)
router.post('/removeWishlist',userauth.noUser,wishlistcontroller.removeWishlist)
router.post('/removeWishData',userauth.noUser,wishlistcontroller.removeWishData)
router.post('/AddToCart',userauth.noUser,wishlistcontroller.AddToCart)




//wallet
router.get('/wallet',userauth.noUser,usercontroller.wallet)

//change account
router.get('/changepassword',userauth.noUser,changePasswordController.change)
router.post('/changepassword',changePasswordController.changepassword)

//product Detail
router.get('/productDetail',userproductDetailController.productDetail)

//confirm order
router.get('/confirmOrder',usercontroller.confirmorder)
router.post('/orderSuccess',usercontroller.orderSuccess)


//checkout
router.get('/changeAccount',userauth.noUser,profilecontroller.changeAccount)
router.post('/updateAction',profilecontroller.updateAction)
router.get("/failedOrder",failedController.failedOrder)

//order
router.get('/order',userauth.noUser,profilecontroller.order)
router.post('/orderCancel',profilecontroller.orderCancel)
router.post('/orderReturn',profilecontroller.orderReturn)
router.get('/orderDetails',userauth.noUser,profilecontroller.orderDetails)

router.post('/applyCoupon',usercontroller.applyCoupon)
router.post('/removeCoupon',usercontroller.removeCoupon)


router.get('/wallethistory',userauth.noUser,walletcontroller.wallet)
router.get('/download-invoice',userauth.noUser,usercontroller.downloadBill)



router.get('/logout',usercontroller.logout)

module.exports=router