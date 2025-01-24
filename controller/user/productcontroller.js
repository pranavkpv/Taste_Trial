const foodschema = require('../../model/foodschema')
const categoryschema = require('../../model/categoryschema')





const product = async (req, res) => {
   try {
      const isveg = req.query.isveg
      const duration = req.query.duration
      const categoryId  = req.query.categoryId
      const searcheditemname = req.query.product || ''; // Get the search query
      const selectedpage = Number(req.query.pagenumber) || 1; // Get the page number
      const limit = 12; // Number of categories per page
      const skip = (selectedpage - 1) * limit; // Calculate the skip value
      // Search filter
      const searchFilter = searcheditemname
         ? { foodname: { $regex: searcheditemname, $options: 'i' } }
         : {};
     
     
      const finalFilter = {
         ...searchFilter,
         is_blocked: false, // Add this condition
         category_id:categoryId,
         is_veg: isveg,
      };
      if(!isveg || isveg=="all"){
         delete finalFilter.is_veg
      } 
    


      // Get filtered data count
      const totaldata = await foodschema.countDocuments(finalFilter);
      const page = Math.ceil(totaldata / limit);
     const categoryname=await categoryschema.findOne({_id:categoryId})
      // Get filtered and paginated data
      if(duration=="lth"){
         var foods = await foodschema.find(finalFilter).skip(skip).limit(limit).sort({duration_time:1});
      }else if(duration=="htl"){
         var foods = await foodschema.find(finalFilter).skip(skip).limit(limit).sort({duration_time:-1});
      }else{
         var foods = await foodschema.find(finalFilter).skip(skip).limit(limit);
      }
      
      console.log(page)
      res.render('user/product', { foods, searchmessage:"foods",page,selectedpage,searcheditemname,categoryname,categoryId })
   } catch (error) {
      console.log(error)
   }
}
module.exports = { product }