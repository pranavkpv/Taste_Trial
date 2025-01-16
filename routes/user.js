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

// Route to start the Google OAuth login
router.get('/auth/google', passport.authenticate('google', {
   scope: ['profile', 'email']
 }));
 
 // Google callback route to handle the redirect
router.get('/load',loadcontroller.userload)
//signup 
router.get('/signup',usercontroller.usersignup)
router.post('/signup',usercontroller.adduser)
//login
router.get('/login',usercontroller.userlogin)
router.post('/login',usercontroller.validuser)

// verifyOTP
router.get('/verifyOTP',usercontroller.verifyOTP)
router.post('/verifyOTP',usercontroller.verifyOTPpost)


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
router.get('/forgotpassword',usercontroller.forgotpassword)
router.post('/forgotpassword',usercontroller.emailverification)

//verify
router.get('/verify',usercontroller.verify)
router.post('/verify',usercontroller.verifypost)

//vonfirm password
router.get('/confirmpassword',usercontroller.confirmpassword)
router.post('/confirmPassword',usercontroller.confirmPassword)
//profile
router.get('/dashboard',profilecontroller.dashboard)

// review
router.get('/review',usercontroller.review)

//address
router.get('/address/:id',profilecontroller.address)
router.post('/addAddress',profilecontroller.addAddress)
router.post('/editAddress',profilecontroller.editAddress)
router.post('/deleteAddress',profilecontroller.deleteAddress)

//AddTocart
router.post('/productcart',userproductDetailController.productcart)

//order
router.get('/order',usercontroller.order)

//cart
router.get('/cart',cartcontroller.cart)
router.post('/removeCart',cartcontroller.removeCart)

//wishlist
router.get('/wishlist',usercontroller.wishlist)

//wallet
router.get('/wallet',usercontroller.wallet)

//change account
router.get('/change',usercontroller.change)

//product Detail
router.get('/productDetail',userproductDetailController.productDetail)


router.get('/confirmorder',usercontroller.confirmorder)
router.post('/orderSuccess',usercontroller.orderSuccess)

router.get('/changeAccount/:id',profilecontroller.changeAccount)
router.post('/updateAction',profilecontroller.updateAction)

//order
router.get('/order/:id',profilecontroller.order)
router.post('/orderCancel',profilecontroller.orderCancel)

router.get('/logout',usercontroller.logout)

module.exports=router