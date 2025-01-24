
const adminschema = require("../../model/adminschema")
const orderschema = require("../../model/orderschema")
const userschema = require("../../model/usershema")



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

const dashboard =async (req, res) => {
   try {
      const orders=await orderschema.find({})
      console.log(orders)
      const totalOrderAmount=orders.reduce((sum,element)=>{
        return sum+=element.totalAmount
      },0)
      const totalOfferAmount=orders.reduce((sum,element)=>{
         return sum+=element.totalOffer
      },0)
      const order=await orderschema.aggregate([{
         $lookup:{
            from:"coupons",
            localField:"couponId",
            foreignField:"_id",
            as:"couponDetails"
         }
      }])
      const couponSum = order.reduce((sum, element) => {
         if (element.couponDetails.length > 0) {
            sum = sum + ((element.totalAmount - element.totalOffer) * element.couponDetails[0].discount_per / 100)
         }
         return sum
      }, 0)

      const usersCount=await userschema.countDocuments()
      const blockUserCount=await userschema.countDocuments({is_blocked:true})
      const unblockUserCount=await userschema.countDocuments({is_blocked:false})
      const orderNumber = await orderschema.countDocuments()
      res.render('admin/dashboard',{orderNumber,totalOrderAmount,totalOfferAmount,couponSum,
         usersCount,blockUserCount,unblockUserCount})
   } catch (error) {
      console.log(error)
   }
}





module.exports = {
   login, validLogin,
    dashboard,
  
}