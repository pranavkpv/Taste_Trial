const express = require('express');
const router = express.Router();
const passport = require('passport');

const usercontroller = require("../controller/user/usercontroller");
const userauth = require("../middleware/userauth");
const loadcontroller = require('../controller/user/loadcontroller');
const homecontroller = require('../controller/user/homecontroller');
const productcontroller = require('../controller/user/productcontroller');
const userhotelcontroller = require('../controller/user/userhotelcontroller');
const uservarientcontroller = require('../controller/user/uservarientcontroller');
const userproductDetailController = require('../controller/user/userproductDetail');
const profilecontroller = require("../controller/user/profilecontroller");
const categorycontroller = require("../controller/user/categorycontroller");
const cartcontroller = require("../controller/user/cartcontroller");
const wishlistcontroller = require("../controller/user/wishlistcontroller");
const walletcontroller = require("../controller/user/walletController");
const changePasswordController = require("../controller/user/changePassword");
const failedController = require("../controller/user/failedOrder");

// ---------------------- PUBLIC ROUTES ----------------------

// Google OAuth
router.get('/auth/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

// Google callback route
router.get('/load', loadcontroller.userload);

// Signup and OTP verification
router.get('/signup', usercontroller.usersignup);
router.post('/verifyOTP', usercontroller.adduser);
router.post('/resendOTP', usercontroller.resendOTP);

// Login
router.post('/login', usercontroller.validuser);

// OTP verification
router.get('/verifyOTP', usercontroller.verifyOTP);
router.post('/confirmOTP', usercontroller.verifyOTPpost);
router.post('/resend', usercontroller.resend);

// Forgot password process
router.get('/emailverification', usercontroller.forgotpassword);
router.post('/emailverification', usercontroller.emailverification);
router.get('/verify', usercontroller.verify);
router.post('/verifypost', usercontroller.verifypost);
router.get('/confirmpassword', usercontroller.confirmpassword);
router.post('/confirmPassword', usercontroller.confirmPassword);

// ---------------------- APPLY AUTH MIDDLEWARE GLOBALLY ----------------------
router.use(userauth.noUser); // All routes below require authentication

// ---------------------- AUTHENTICATED ROUTES ----------------------

// Home
router.get('/home', homecontroller.home);

// Categories
router.get('/category', categorycontroller.category);

// Products
router.get('/product', productcontroller.product);
router.get('/productDetail', userproductDetailController.productDetail);
router.post('/productcart', userproductDetailController.productcart);

// Hotels
router.get('/hotels', userhotelcontroller.hotel);

// Variants
router.get('/varient', uservarientcontroller.varient);

// Profile & Dashboard
router.get('/dashboard', profilecontroller.dashboard);
router.get('/address', profilecontroller.address);
router.post('/addAddress', profilecontroller.addAddress);
router.post('/editAddress', profilecontroller.editAddress);
router.post('/deleteAddress', profilecontroller.deleteAddress);

// Cart
router.get('/cart', cartcontroller.cart);
router.post('/removeCart', cartcontroller.removeCart);

// Wishlist
router.get('/wishlist', wishlistcontroller.wishlist);
router.post('/addToWishlist', wishlistcontroller.addToWishlist);
router.post('/removeWishlist', wishlistcontroller.removeWishlist);
router.post('/removeWishData', wishlistcontroller.removeWishData);
router.post('/AddToCart', wishlistcontroller.AddToCart);

// Wallet
router.get('/wallet', usercontroller.wallet);
router.get('/wallethistory', walletcontroller.wallet);

// Orders
router.get('/order', profilecontroller.order);
router.post('/orderCancel', profilecontroller.orderCancel);
router.post('/orderReturn', profilecontroller.orderReturn);
router.get('/orderDetails', profilecontroller.orderDetails);
router.get("/failedOrder", failedController.failedOrder);

// Checkout and Confirmation
router.get('/confirmOrder', usercontroller.confirmorder);
router.post('/orderSuccess', usercontroller.orderSuccess);

// Account & Password
router.get('/changepassword', changePasswordController.change);
router.post('/changepassword', changePasswordController.changepassword);
router.get('/changeAccount', profilecontroller.changeAccount);
router.post('/updateAction', profilecontroller.updateAction);
router.post('/deleteAccount', usercontroller.deleteAccount);

// Coupon
router.post('/applyCoupon', usercontroller.applyCoupon);
router.post('/removeCoupon', usercontroller.removeCoupon);

// Invoice
router.get('/download-invoice', usercontroller.downloadBill);

// Review
router.get('/review', usercontroller.review);

// Logout
router.get('/logout', usercontroller.logout);

module.exports = router;
