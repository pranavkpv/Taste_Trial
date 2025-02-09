
const adminschema = require("../../model/adminschema")
const orderschema = require("../../model/orderschema")
const userschema = require("../../model/usershema")
const session = require('express-session')



const validLogin = async (req, res) => {
   try {
      const { username, password } = req.body;
      const existUsername=await adminschema.findOne()
      const error=[]
      if(username==""){
         error.push("Username Is Required")
      }
      if(password==""){
         error.push("Password Is Required")
      }
       if(username != existUsername.username){
         error.push("Username Is Wrong")
      }
       if(password != existUsername.password){
        error.push("Password is Wrong")
      }
      else{
         req.session.admin=true
         error.push("Login success")
       }
      if(error.length>0){
         return res.json({message:error.join(',')})
      }      
   } catch (error) {
      console.error("Login Error:", error);
      req.flash('loginError', 'An error occurred. Please try again.');
      res.redirect('/admin/login');
   }
};
const login = (req, res) => {
   const loginvalidmessage = req.flash('loginError'); // Retrieve the message
   const nocondentloginmessage = req.flash('nocondentlogin')
   res.render("admin/login", { loginvalidmessage, nocondentloginmessage });
};







module.exports = {
   login, validLogin,
  
}