const usershema = require("../model/usershema")


const noUser = async (req, res, next) => {
   try {
      if (req.session.user) {
         const userId = req.session.user
         const userById = await usershema.findById(userId)
         if (!userById) {
            req.flash("notExist", "Please Login To Continue")
            res.redirect('/user/load')
            return
         }
         if (userById.is_blocked) {
            req.flash("notExist", "Please Login To Continue")
            res.redirect('/user/load')
            return
         }
         next()
      } else {
         req.flash("notExist", "Please Login To Continue")
         res.redirect('/user/load')
      }

   } catch (error) {
      console.log(error)
   }
}
module.exports = {
   noUser
}