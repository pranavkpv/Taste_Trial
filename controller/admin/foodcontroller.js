const foodschema = require('../../model/foodschema')
const categoryschema = require('../../model/categoryschema')

const food = async (req, res) => {
   try {
      const searchedfoodname = req.query.food || ''; // Get the search query
      const selectedpage = Number(req.query.pagenumber) || 1; // Get the page number
      const limit = 5; // Number of categories per page
      const skip = (selectedpage - 1) * limit; // Calculate the skip value

      // Search filter
      const searchFilter = searchedfoodname
         ? { foodname: { $regex: searchedfoodname, $options: 'i' } }
         : {};

      // Get filtered data count
      const totaldata = await foodschema.countDocuments(searchFilter);
      const page = Math.ceil(totaldata / limit);

      // Get filtered and paginated data
      const startIndex = skip + 1
      const errormessage = req.flash('error')
      const successmessage = req.flash('success')
      const existmessage = req.flash('exist')
      const editexistmessage = req.flash('editexist')
      const foods = await foodschema.aggregate([
         {
            $lookup: {
               from: "categories",
               localField: "category_id",
               foreignField: "_id",
               as: "categoryDetails"
            }
         },
         {$match:searchFilter},
         { $skip: skip }, // Skip the specified number of documents
         { $limit: limit } // Limit the number of documents returned
      ]);
      console.log(foods)
      const categories = await categoryschema.find()
      res.render('admin/food', { foods, categories, errormessage, successmessage, existmessage, editexistmessage,searchedfoodname ,startIndex,page})
   } catch (error) {
      console.log(error)
      req.flash('error', "An Error Occured");
      res.redirect('/admin/food');
   }
}

const addFood = async (req, res) => {
   try {
      const { foodname, category_id, isveg } = req.body;
      const file = req.file;
      const existFood = await foodschema.findOne({ foodname })
      if (existFood) {
         req.flash('exist', "Food Is Already Exist");
         res.redirect('/admin/food');
      } else {
         const image = `/uploads/${ file.filename }`
         const newFood = new foodschema({
            foodname,
            category_id,
            is_veg: isveg,
            image
         })
         await newFood.save()
         req.flash('success', "Food Is Saved SuccessFully");
         res.redirect('/admin/food');
      }


   } catch (error) {
      console.log(error)
   }

};


const editFood = async (req, res) => {
   try {
      const {
         foodname,
         category_id,
         is_veg,
         editid
      } = req.body;
      const file = req.file;
      const existfood = await foodschema.find({ _id: { $ne: editid } });
      const countDocument = await foodschema.countDocuments() - 1
      let existvalue = 0;
      for (let i = 0; i < countDocument; i++) {
         if (existfood[i].foodname === foodname) {
            existvalue++;
         }
      }
      if (existvalue > 0) {
         req.flash('editexist', "Food Already Exist");
         res.redirect('/admin/food');
      } else {
         if (!file) {
            await foodschema.findByIdAndUpdate({ _id: editid }, { foodname, category_id, is_veg });
            req.flash('success', "Food Updated Successfully");
            res.redirect('/admin/food');
         } else {
            const image = `/uploads/${ file.filename }`
            console.log(image)
            await foodschema.findByIdAndUpdate({ _id: editid }, { foodname, category_id, is_veg, image });
            req.flash('success', "Food Updated Successfully");
            res.redirect('/admin/food');
         }
      }
   } catch (error) {
      console.error(error);
      req.flash('error', "An Error Occurred");
      return res.redirect('/admin/food');
   }
}


const blockFood = async (req, res) => {
   try {
      const { hideid } = req.body
      await foodschema.findByIdAndUpdate({ _id: hideid }, { is_blocked: true })
      req.flash('success', "Food Is Hide Successfully")
      res.redirect('/admin/food')
   } catch (error) {
      req.flash('error', "An Error Occured")
      res.redirect('/admin/food')
   }
}

const unblockFood = async (req, res) => {
   try {
      const { unhideid } = req.body
      await foodschema.findByIdAndUpdate({ _id: unhideid }, { is_blocked: false })
      req.flash('success', "Food Is Unhide Successfully")
      res.redirect('/admin/food')
   } catch (error) {
      req.flash('error', "An Error Occured")
      res.redirect('/admin/food')
   }

}

const deleteFood = async (req, res) => {
   try {
      const { deleteid } = req.body
      await foodschema.findByIdAndDelete({ _id: deleteid })
      req.flash('success', "Food Is Deleted Successfully")
      res.redirect('/admin/food')
   } catch (error) {
      req.flash('error', "An Error Occured")
      res.redirect('/admin/food')
   }
}


module.exports = {
   addFood,
   editFood, blockFood, unblockFood, food, deleteFood
}