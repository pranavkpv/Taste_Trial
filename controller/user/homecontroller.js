const bannerschema = require('../../model/bannerschema')
const categoryschema = require('../../model/categoryschema')
const foodschema = require("../../model/foodschema")


const home = async (req, res) => {
   try {
      const successmessage = req.flash('success')
      const searcheditemname = req.query.category || ''; // Get the search query
      const selectedpage = Number(req.query.pagenumber) || 1; // Get the page number
      const limit = 9; // Number of categories per page
      const skip = (selectedpage - 1) * limit; // Calculate the skip value

      // Search filter
      const searchFilter = searcheditemname
         ? { categoryname: { $regex: searcheditemname, $options: 'i' } }
         : {};

         const finalFilter = {
            ...searchFilter,
            isdeleted: false, // Add this condition
         };

      // Get filtered data count
      const totaldata = await categoryschema.countDocuments(finalFilter);
      const page = Math.ceil(totaldata / limit);

      // Get filtered and paginated data
      const categories = await categoryschema.find(finalFilter).skip(skip).limit(limit);
      const banners = await bannerschema.find({ is_blocked: false })
      const foods = await foodschema.find({ is_blocked: false })
      res.render('user/home', { banners, categories, foods, searchmessage: "category",searcheditemname,page,selectedpage,successmessage  })
   } catch (error) {
      console.log(error)
   }
}

module.exports = { home }