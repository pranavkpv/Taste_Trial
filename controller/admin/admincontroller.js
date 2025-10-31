
const adminschema = require("../../model/adminschema")




const validLogin = async (req, res) => {
   try {
      const { username, password } = req.body;
      const existUsername = await adminschema.findOne()
      const error = []
      if (username == "") {
         error.push("Username Is Required")
      }
      if (password == "") {
         error.push("Password Is Required")
      }
      if (username != existUsername.username) {
         error.push("Username Is Wrong")
      }
      if (password != existUsername.password) {
         error.push("Password Is Wrong")
      }
      if (error.length > 0) {
         return res.status(400).json({ success: false, message: error.join(',') })
      }
      req.session.admin = true
      return res.status(200).json({ success: true, message: 'Login successfully' })
   } catch (error) {
      console.error("Login Error:", error);
      req.flash('loginError', 'An error occurred. Please try again.');
      res.redirect('/admin/login');
   }
};

//get admin login page
const login = (req, res) => {
   const noAdmin = req.flash('noAdmin')
   const loginvalidmessage = req.flash('loginError');
   const nocondentloginmessage = req.flash('nocondentlogin')
   res.render("admin/login", { loginvalidmessage, nocondentloginmessage, noAdmin });
};







module.exports = {
   login, validLogin,

}