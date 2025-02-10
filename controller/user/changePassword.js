const userschema = require('../../model/usershema')
const bcrypt = require('bcrypt')

const change = async (req, res) => {
   try {
      const userid = req.session.user
      const successmessage = req.flash('success')
      const currentPassword = req.flash('currentPassword')
      const newPassword = req.flash('newPassword')
      const errormessage = req.flash('error')
      res.render('user/changePassword', { userid, errormessage, searchmessage: "", searcheditemname: "", successmessage, currentPassword, newPassword })
   } catch (error) {
      console.log(error)
   }
}

const changepassword = async (req, res) => {
   try {
   
      const { currentPassword, newPassword, confirmPassword } = req.body
      const userid = req.session.user

    
      const existPassword = await userschema.findById({ _id: userid })
      console.log(existPassword)
      const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&#^()\-_=+{}[\]<>])[A-Za-z\d@$!%*?&#^()\-_=+{}[\]<>]{8,}$/;

      if (currentPassword == "" || newPassword == "" || confirmPassword == "") {
         return res.json({ nocontent: "Please Enter All The Field" })
      }
      const match = await bcrypt.compare(currentPassword, existPassword.password);

      if (!match) {
         return res.json({ notMatch: "Current Password is wrong" });
      }
      if (newPassword != confirmPassword) {
         return res.json({ notMatch: "Password is not match" })
      }
      if (!passwordRegex.test(newPassword)) {
         return res.json({ passwordFormat: "Password must include at least one uppercase letter, one lowercase letter, one number, one special character, and be at least 8 characters long." });
      }
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt)
      await userschema.findByIdAndUpdate({ _id: userid }, { password: hashedPassword })
      return res.json({ success: "User Password Changed SucessFully" })

   } catch (error) {
      console.log(error)
   }
}

module.exports = { changepassword, change }