const foodschema = require('../../model/foodschema')
const categoryschema = require('../../model/categoryschema')





const product = async (req, res) => {
   try {
      const isveg = req.query.isveg;
      const duration = req.query.duration;
      const categoryId = req.query.categoryId;
      const searcheditemname = req.query.product || ""; // Get the search query
      const selectedpage = Number(req.query.pagenumber) || 1; // Get the page number
      const limit = 12; // Number of categories per page
      const skip = (selectedpage - 1) * limit; // Calculate the skip value
      const offer = req.query.offer;

      // Search filter
      const searchFilter = searcheditemname
         ? { foodname: { $regex: searcheditemname, $options: "i" } }
         : {};

      // Define finalFilter globally
      let finalFilter = {
         ...searchFilter,
         is_blocked: false, // Add this condition
         category_id: categoryId,
      };

      if (isveg && isveg !== "all") {
         finalFilter.is_veg = isveg === "veg" ? "veg" : "non-veg"; // Fix incorrect condition
      }

      // Get filtered data count
      var totaldata = await foodschema.countDocuments(finalFilter);

      const categoryname = await categoryschema.findOne({ _id: categoryId });

      // Get filtered and paginated data
      let foods;

      if (offer == 1) {
         foods = await foodschema.find(finalFilter).where("offer").gt(0).skip(skip).limit(limit).sort({ duration_time: -1 });
         totaldata = foods.length;
      } else if (duration === "lth") {
         foods = await foodschema.find(finalFilter).skip(skip).limit(limit).sort({ duration_time: 1 });
      } else if (duration === "htl") {
         foods = await foodschema.find(finalFilter).skip(skip).limit(limit).sort({ duration_time: -1 });
      } else {
         foods = await foodschema.find(finalFilter).skip(skip).limit(limit);
      }

      const page = Math.ceil(totaldata / limit);

      res.render("user/product", {
         foods,
         offer,
         searchmessage: "foods",
         page,
         selectedpage,
         searcheditemname,
         categoryname,
         categoryId,
         isveg,
         duration,
      });

   } catch (error) {
      console.log(error);
      res.status(500).send("An error occurred.");
   }
};

module.exports = { product }