const userschema = require('../../model/usershema')

const change = async (req, res) => {
   try {
      const userid = req.session.user
      const successmessage = req.flash('success')
      const currentPassword = req.flash('currentPassword')
      const newPassword = req.flash('newPassword')
      const errormessage = req.flash('error')
      res.render('user/changePassword', { userid,errormessage, searchmessage: "", searcheditemname: "", successmessage, currentPassword, newPassword })
   } catch (error) {
      console.log(error)
   }
}

const changepassword = async (req, res) => {
   try {
      const { currentPassword, newPassword, confirmPassword } = req.body
      const userid = req.session.user
      const existPassword = await userschema.findOne({ _id: userid ,password: currentPassword })
      const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&#^()\-_=+{}[\]<>])[A-Za-z\d@$!%*?&#^()\-_=+{}[\]<>]{8,}$/;
   
      if (!existPassword) {
         req.flash('error', "Password is wrong")
         res.redirect('/user/changePassword')
      }else if(newPassword!=confirmPassword){
         req.flash('error', "Password is not match")
         res.redirect('/user/changePassword')
      }else if(!passwordRegex.test(newPassword)){
         req.flash("error", "Password must include at least one uppercase letter, one lowercase letter, one number, one special character, and be at least 8 characters long.");
         return res.redirect("/user/signup");
      }else{
         await userschema.findByIdAndUpdate({_id:userid},{password:newPassword})
         req.flash('success', "User Password Changed SucessFully")
         res.redirect('/user/changePassword')
      }
      

   } catch (error) {
      console.log(error)
   }
}

module.exports = { changepassword, change }