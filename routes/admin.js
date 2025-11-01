const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = require("../utils/multer/upload");

const admincontroller = require('../controller/admin/admincontroller');
const bannercontroller = require('../controller/admin/bannercontrolle');
const categorycontroller = require('../controller/admin/categorycontroller');
const hotelcontroller = require("../controller/admin/hotelcontroller");
const usermanagecontroller = require("../controller/admin/usermanagecontroller");
const foodcontroller = require("../controller/admin/foodcontroller");
const varientcontroller = require("../controller/admin/varientcontroller");
const ratecontroller = require("../controller/admin/ratecontroller");
const ordercontroller = require("../controller/admin/ordercontroller");
const returncontroller = require("../controller/admin/returncontroller");
const couponcontroller = require("../controller/admin/couponcontroller");
const reportController = require("../controller/admin/reportController");
const dashboardController = require("../controller/admin/dashboardController");
const deliveryController = require("../controller/admin/deliveryController");
const adminAuth = require("../middleware/adminauth");

// ---------------------- PUBLIC ROUTES ----------------------

// Admin login routes
router.get("/login", admincontroller.login);
router.post("/login", admincontroller.validLogin);

// ---------------------- APPLY ADMIN AUTH MIDDLEWARE GLOBALLY ----------------------
router.use(adminAuth.adminLog); // all routes below require admin login

// ---------------------- PROTECTED ADMIN ROUTES ----------------------

// Dashboard
router.get("/dashboard", dashboardController.dashboard);

// User Management
router.get("/usermanagement", usermanagecontroller.usermanagement);
router.post("/blockUser", usermanagecontroller.blockUser);
router.post("/unblockUser", usermanagecontroller.unblockUser);

// Food Management
router.get("/food", foodcontroller.food);
router.post("/addFood", upload.single('image'), foodcontroller.addFood);
router.post("/editFood", upload.single('image'), foodcontroller.editFood);
router.post("/hidefood", foodcontroller.blockFood);
router.post("/unhidefood", foodcontroller.unblockFood);
router.post("/deletefood", foodcontroller.deleteFood);

// Hotel Management
router.get("/hotel", hotelcontroller.hotel);
router.post("/addHotel", upload.single('image'), hotelcontroller.addHotel);
router.post("/editHotel", upload.single('image'), hotelcontroller.editHotel);
router.post("/hideHotel", hotelcontroller.blockHotel);
router.post("/unhideHotel", hotelcontroller.unblockHotel);
router.post("/deleteHotel", hotelcontroller.deleteHotel);

// Category Management
router.get("/category", categorycontroller.category);
router.post("/addcategory", upload.single('image'), categorycontroller.addcategory);
router.post("/editcategory", upload.single('image'), categorycontroller.editcategory);
router.post("/hidecategory", categorycontroller.hidecategory);
router.post("/unhidecategory", categorycontroller.unhidecategory);
router.post("/deletecategory", categorycontroller.deletecategory);

// Banner Management
router.get("/banner", bannercontroller.banner);
router.post('/addbanner', (req, res) => {
  upload.single('image')(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      req.flash('error', 'File too large! Maximum allowed size is 2MB.');
      return res.redirect('/admin/banner');
    } else if (err) {
      req.flash('error', err.message);
      return res.redirect('/admin/banner');
    }
    bannercontroller.addbanner(req, res);
  });
});
router.post('/editbanner', upload.single('image'), bannercontroller.editbanner);
router.post('/hidebanner', bannercontroller.blockbanner);
router.post('/unhidebanner', bannercontroller.unblockbanner);
router.post('/deletebanner', bannercontroller.deletebanner);

// Variant Management
router.get("/varient", varientcontroller.varient);
router.post("/addvarient", varientcontroller.addvarient);
router.post("/editvarient", varientcontroller.editvarient);
router.post("/blockvarient", varientcontroller.blockvarient);
router.post("/unblockvarient", varientcontroller.unblockvarient);
router.post("/deletevarient", varientcontroller.deletevarient);

// Rate Management
router.get("/rate", ratecontroller.rate);
router.post("/addrate", upload.array('images', 3), ratecontroller.addrate);
router.post("/editRate", upload.array('images', 3), ratecontroller.editrate);
router.post("/deleterate", ratecontroller.deleterate);

// Order Management
router.get("/order", ordercontroller.order);
router.post("/updateStatus", ordercontroller.updateStatus);
router.get("/orderDetails", ordercontroller.orderDetails);

// Return Management
router.get("/returndata", returncontroller.returndata);
router.post("/approveReturn", returncontroller.approveReturn);
router.post("/rejectReturn", returncontroller.rejectReturn);

// Coupon Management
router.get("/coupon", couponcontroller.coupon);
router.post("/addcoupon", couponcontroller.addcoupon);
router.post("/editCoupon", couponcontroller.editCoupon);
router.post('/deleteCoupon', couponcontroller.deleteCoupon);

// Reports
router.get("/salesReport", reportController.salesReport);

// Delivery Location Management
router.get('/delivery', deliveryController.delivery);
router.post('/addLocation', deliveryController.addLocation);
router.post('/editLocation', deliveryController.editLocation);
router.post('/deleteLocation', deliveryController.deleteLocation);

module.exports = router;
