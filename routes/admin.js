const express=require('express')
const router=express.Router()
const admincontroller=require('../controller/admin/admincontroller')
const bannercontroller=require('../controller/admin/bannercontrolle')
const categorycontroller=require('../controller/admin/categorycontroller')
const upload = require("../utils/multer/upload");
const hotelcontroller=require("../controller/admin/hotelcontroller")
const usermanagecontroller=require("../controller/admin/usermanagecontroller")
const foodcontroller=require("../controller/admin/foodcontroller")
const varientcontroller=require("../controller/admin/varientcontroller")
const ratecontroller=require("../controller/admin/ratecontroller")
const ordercontroller=require("../controller/admin/ordercontroller")
const returncontroller=require("../controller/admin/returncontroller")
const couponcontroller=require("../controller/admin/couponcontroller")
const reportController=require("../controller/admin/reportController")
const dashboardController=require("../controller/admin/dashboardController")


router.get("/login",admincontroller.login)
router.post("/login",admincontroller.validLogin)


router.get("/dashboard",dashboardController.dashboard)
router.get("/usermanagement",usermanagecontroller.usermanagement)
router.post("/blockUser",usermanagecontroller.blockUser)
router.post("/unblockUser",usermanagecontroller.unblockUser)


router.get("/food",foodcontroller.food)
router.post("/addFood", upload.single('image'),foodcontroller.addFood)
router.post("/editFood",upload.single('image'),foodcontroller.editFood)
router.post("/hidefood",foodcontroller.blockFood)
router.post("/unhidefood",foodcontroller.unblockFood)
router.post("/deletefood",foodcontroller.deleteFood)




router.get("/hotel",hotelcontroller.hotel)
router.post("/addHotel",upload.single('image'),hotelcontroller.addHotel)
router.post("/editHotel",upload.single('image'),hotelcontroller.editHotel)
router.post("/hideHotel",hotelcontroller.blockHotel)
router.post("/unhideHotel",hotelcontroller.unblockHotel)
router.post("/deleteHotel",hotelcontroller.deleteHotel)



router.get("/category",categorycontroller.category)
router.post("/addcategory", upload.single('image'), categorycontroller.addcategory);
router.post("/editcategory", upload.single('image'),categorycontroller.editcategory)
router.post("/hidecategory",categorycontroller.hidecategory)
router.post("/unhidecategory",categorycontroller.unhidecategory)
router.post("/deletecategory",categorycontroller.deletecategory)


router.get("/banner",bannercontroller.banner)
router.post('/addbanner', upload.single('image'),bannercontroller.addbanner);
router.post('/editbanner',upload.single('image'),bannercontroller.editbanner);
router.post('/hidebanner',bannercontroller.blockbanner);
router.post('/unhidebanner',bannercontroller.unblockbanner)
router.post('/deletebanner',bannercontroller.deletebanner)


router.get("/varient",varientcontroller.varient)
router.post("/addvarient",varientcontroller.addvarient)
router.post("/editvarient",varientcontroller.editvarient)
router.post("/blockvarient",varientcontroller.blockvarient)
router.post("/unblockvarient",varientcontroller.unblockvarient)
router.post("/deletevarient",varientcontroller.deletevarient)




router.get("/rate",ratecontroller.rate)
router.post("/addrate",upload.array('images',3),ratecontroller.addrate)
router.post("/editRate",upload.array('images',3),ratecontroller.editrate)
router.post("/deleterate",ratecontroller.deleterate)



router.get("/order",ordercontroller.order)
router.post("/updateStatus",ordercontroller.updateStatus)
router.get("/orderDetails",ordercontroller.orderDetails)

router.get("/returndata",returncontroller.returndata)
router.post("/approveReturn",returncontroller.approveReturn)
router.post("/rejectReturn",returncontroller.rejectReturn)


router.get("/coupon",couponcontroller.coupon)
router.post("/addcoupon",couponcontroller.addcoupon)
router.post("/editCoupon",couponcontroller.editCoupon)
router.post('/deleteCoupon',couponcontroller.deleteCoupon)


router.get("/salesReport",reportController.salesReport)




module.exports=router