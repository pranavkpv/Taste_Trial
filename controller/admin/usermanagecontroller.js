const userschema = require('../../model/usershema')
const usermanagement = async (req, res) => {
   try {
      const searcheduser = req.query.user || ''; // Get the search query
      const selectedpage = Number(req.query.pagenumber) || 1; // Get the page number
      const limit = 5; // Number of categories per page
      const skip = (selectedpage - 1) * limit; // Calculate the skip value

      // Search filter
      const searchFilter = searcheduser
         ? { firstname: { $regex: searcheduser, $options: 'i' } }
         : {};

      // Get filtered data count
      const totaldata = await userschema.countDocuments(searchFilter);
      const page = Math.ceil(totaldata / limit);

      // Get filtered and paginated data
      const users = await userschema.find(searchFilter).skip(skip).limit(limit);
      const startIndex=skip+1
      const successmessage = req.flash('success')
      const errormessage = req.flash('error')
      res.render("admin/usermanagement", { users, errormessage, successmessage,searcheduser ,startIndex,page})
   } catch (error) {
      req.flash("error", "An Error Occured")
      res.redirect("/admin/login")
   }
}

const blockUser = async (req, res) => {
   try {
      const { hideid } = req.body
      await userschema.findByIdAndUpdate({ _id: hideid }, { is_blocked: true })
      req.flash("success", "User Blocked Successfully")
      res.redirect("/admin/usermanagement")
   } catch (error) {
      req.flash("error", "An Error Occured")
      res.redirect("/admin/usermanagement")
   }
}
const unblockUser = async (req, res) => {
   try {
      const { unhideid } = req.body
      await userschema.findByIdAndUpdate({ _id: unhideid }, { is_blocked: false })
      req.flash("success", "User Unblocked Successfully")
      res.redirect("/admin/usermanagement")
   } catch (error) {
      req.flash("error", "An Error Occured")
      res.redirect("/admin/usermanagement")
   }
}

module.exports = {
   usermanagement, blockUser, unblockUser,
}