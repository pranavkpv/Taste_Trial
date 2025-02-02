const foodschema = require('../../model/foodschema')
const categoryschema = require('../../model/categoryschema')
const mongoose = require('mongoose')

const food = async (req, res) => {
   try {
      const category=req.query.category
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
      let foods = await foodschema.aggregate([
         {
            $lookup: {
               from: "categories",
               localField: "category_id",
               foreignField: "_id",
               as: "categoryDetails"
            }
         },
         {
            $match: { 
               ...searchFilter, 
            }
         },
         { $skip: skip }, 
         { $limit: limit } 
      ]);
      
      foods = foods.map(food => {
         if (food.expiry_date) {
            food.formattedExpiryDate = new Date(food.expiry_date)
               .toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" })
               .split("/")
               .join("-");
         }
         return food;
      });
     if(category && category!="all"){
      var foodss=foods.filter((element)=>element.categoryDetails[0]._id==category)
      var selectedCategory=await categoryschema.findOne({_id:category})
     }else{
      var foodss=foods
      var selectedCategory="All" 
     }
      const categories = await categoryschema.find({isdeleted:false})
      res.render('admin/food', { foodss, categories, errormessage, successmessage, existmessage, editexistmessage,searchedfoodname ,startIndex,page,
         category,selectedCategory
      })
   } catch (error) {
      console.log(error)
      req.flash('error', "An Error Occured");
      res.redirect('/admin/food');
   }
}

const addFood = async (req, res) => {
   try {
      const { foodname, category_id, isveg,duration_time,offer,expirydate } = req.body;
      const file = req.file;
      const existFood = await foodschema.findOne({ foodname })
      if(offer==0 && expirydate==""){
         const image = `/uploads/${ file.filename }`
         const newFoods = new foodschema({
            foodname,
            category_id,
            is_veg: isveg,
            image,
            duration_time,
            offer
         })
         await newFoods.save()
         req.flash('success', "Food Is Saved SuccessFully");
         res.redirect('/admin/food');
      }
      if (existFood) {
         req.flash('exist', "Food Is Already Exist");
         res.redirect('/admin/food');
      } else {
         const image = `/uploads/${ file.filename }`
         const newFood = new foodschema({
            foodname,
            category_id,
            is_veg: isveg,
            image,
            duration_time,
            offer,
            expiry_date:expirydate
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
         editid,
         duration_time,
         Offer,
         expirydate
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
            await foodschema.findByIdAndUpdate({ _id: editid }, { foodname, category_id, is_veg,duration_time,offer:Offer,expiry_date:expirydate });
            req.flash('success', "Food Updated Successfully");
            res.redirect('/admin/food');
         } else {
            const image = `/uploads/${ file.filename }`
            await foodschema.findByIdAndUpdate({ _id: editid }, { foodname, category_id, is_veg,duration_time, image,offer:Offer,expiry_date:expirydate });
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