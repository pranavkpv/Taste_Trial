const userschema = require('../model/usershema')
const categoryschema = require('../model/categoryschema')
const bannerschema = require('../model/bannerschema')

// userhome
const userhome=async(req,res)=>{
   const categories = await categoryschema.find({isdeleted:false})
   const banners = await bannerschema.find()
   res.render("user/home",{categories,banners})
}

// userlogin
const userlogin=(req,res)=>{
   res.render("user/login")
}
const validuser=async(req,res)=>{
   try {
      const {username,password}=req.body
      const existuser = await userschema.findOne({email:username,password:password})
      if(existuser){
         const users = await userschema.findOne({email:username})
         const categories = await categoryschema.find({isdeleted:false})
         res.render("user/category",{categories,users})
      }else{
         res.redirect('/user/login')
      }
   } catch (error) {
      console.log(error)
   }
  
}

// category Manage
const userCategory=async(req,res)=>{
   try {
      const users = await userschema.find({})
      const categories = await categoryschema.find({isdeleted:false})
      res.render("user/category",{categories,users})
   } catch (error) {
      console.log(error)
   }
}

// userpage
const userpage=async(req,res)=>{
   try {
      res.render("user/page")
   } catch (error) {
      
   }
}

// product
const userproduct=async(req,res)=>{
   try {
      res.render("user/product")
   } catch (error) {
      
   }
}



module.exports={userlogin,validuser,userCategory,userhome,userpage,userproduct}