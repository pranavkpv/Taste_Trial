
const adminschema = require("../../model/adminschema")
const userschema = require("../../model/usershema")
const categoryschema = require("../../model/categoryschema")
const foodschema = require("../../model/foodschema")
const hotelschema = require("../../model/hotelschema")
const bannerschema = require("../../model/bannerschema")



const validLogin = async (req, res) => {
   try {
      const { username, password } = req.body;
      const namevalidate = await adminschema.findOne({ username });
      const passwordvalidate = await adminschema.findOne({ password });
      if (namevalidate && passwordvalidate) {
         res.render("admin/dashboard");
      } else if (username === "" || password === "") {
         req.flash('nocondentlogin', 'please fill username and password');
         res.redirect('/admin/login');
      } else {
         req.flash('loginError', 'Username or password is wrong, please check');
         res.redirect('/admin/login'); // Redirect to the login page
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

const dashboard = (req, res) => {
   res.render("admin/dashboard")
}





module.exports = {
   login, validLogin,
    dashboard,
  
}