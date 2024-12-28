const express=require('express')
const router=express.Router()
const usercontroller=require("../controller/usercontroller")

router.get('/home',usercontroller.userhome)

router.get('/login',usercontroller.userlogin)
router.post('/category',usercontroller.validuser)

router.get('/category',usercontroller.userCategory)

router.get('/page',usercontroller.userpage)

router.get('/product',usercontroller.userproduct)

module.exports=router