const express=require('express')
const router=express.Router()
const admincontroller=require('../controller/admincontroller')
const upload = require("../utils/multer/upload");

router.get("/login",admincontroller.login)
router.get("/dashboard",admincontroller.dashboard)
router.post("/dashboard",admincontroller.validLogin)
router.get("/category",admincontroller.category)

router.get("/usermanagement",admincontroller.usermanagement)
router.post("/adduser",admincontroller.adduser)
router.post("/editUser",admincontroller.editUser)
router.post("/deleteUser",admincontroller.deleteUser)
router.post("/blockUser",admincontroller.blockUser)
router.post("/unblockUser",admincontroller.unblockUser)


router.get("/food",admincontroller.food)
router.post("/addFood",admincontroller.addFood)
router.post("/editFood",admincontroller.editFood)
router.post("/blockFood",admincontroller.blockFood)
router.post("/unblockFood",admincontroller.unblockFood)



router.get("/hotel",admincontroller.hotel)
router.post("/addHotel",upload.single('photo'),admincontroller.addHotel)
router.post("/editHotel",upload.single('photo'),admincontroller.editHotel)
router.post("/blockHotel",admincontroller.blockHotel)
router.post("/unblockHotel",admincontroller.unblockHotel)



router.post("/addcategory", upload.single('image'), admincontroller.addcategory);
router.post("/editcategory",admincontroller.editcategory)
router.post("/deletecategory",admincontroller.deletecategory)
router.post("/unblockcategory",admincontroller.unblockcategory)

router.get("/banner",admincontroller.banner)
router.post('/addbanner', upload.single('image'),admincontroller.addbanner);


module.exports=router