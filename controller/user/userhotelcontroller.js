const hotelschema = require('../../model/hotelschema')
const userschema = require('../../model/usershema')
const foodschema = require('../../model/foodschema')
const categoryschema = require('../../model/categoryschema')
const hotel = async (req, res) => {
   try {
      const foodId = req.query.foodId
      const searcheditemname = req.query.hotel || ''; // Get the search query
      const selectedpage = Number(req.query.pagenumber) || 1; // Get the page number
      const limit = 12; // Number of categories per page
      const skip = (selectedpage - 1) * limit; // Calculate the skip value

      // Search filter
      const searchFilter = searcheditemname
         ? { hotelname: { $regex: searcheditemname, $options: 'i' } }
         : {};

      const finalFilter = {
         ...searchFilter,
         is_blocked: false, // Add this condition
         food_items:{$in: [foodId]} 
      };

      // Get filtered data count
      const totaldata = await hotelschema.countDocuments(finalFilter);
      const page = Math.ceil(totaldata / limit);
      // Get filtered and paginated data
      const hotels = await hotelschema.find(finalFilter).skip(skip).limit(limit);
      const foodname = await foodschema.findOne({ _id: foodId })
      const category = await categoryschema.findOne({_id:foodname.category_id})
      res.render('user/hotel', { hotels,category, foodname,page,searcheditemname,foodId ,selectedpage,searchmessage:"hotels"})
   } catch (error) {
      console.log(error)
   }
}

module.exports = { hotel }