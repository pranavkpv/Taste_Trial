const categoryschema = require("../../model/categoryschema")

const category = async (req, res) => {
   try {
      const searcheditemname = req.query.category || ''; // Get the search query
      const alphabet = req.query.alphabet
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

     if(alphabet=="atz"){
      var categories = await categoryschema.find(finalFilter).skip(skip).limit(limit).sort({categoryname:1}).collation({ locale: 'en', strength: 2 });
     }else if(alphabet=="zta"){
      var categories = await categoryschema.find(finalFilter).skip(skip).limit(limit).sort({categoryname:-1}).collation({ locale: 'en', strength: 2 });
     }else{
      var categories = await categoryschema.find(finalFilter).skip(skip).limit(limit)
     }
      res.render('user/category', { categories, searchmessage: "category",searcheditemname,page,selectedpage })
   } catch (error) {
      console.log(error)
   }
}


module.exports = { category }