const categoryschema = require('../../model/categoryschema')

const category = async (req, res) => {
   try {
      const searchedcategoryname = req.query.category || ''; 
      const selectedpage = Number(req.query.pagenumber) || 1; 
      const limit = 5; 
      const skip = (selectedpage - 1) * limit; 
      const searchFilter = searchedcategoryname
         ? { categoryname: { $regex: searchedcategoryname, $options: 'i' } }
         : {};
      const totaldata = await categoryschema.countDocuments(searchFilter);
      const page = Math.ceil(totaldata / limit);
      let categories = await categoryschema.find(searchFilter).skip(skip).limit(limit);
       categories = categories.map(category => {
         if (category.expiry_date) {
            category.formattedExpiryDate = new Date(category.expiry_date)
               .toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" })
               .split("/")
               .join("-");
         }
         return category;
      });

      const existmessage = req.flash('exist');
      const successmessage = req.flash('success');
      const errormessage = req.flash('error');
      const editexistmessage = req.flash('editexist');
      const startIndex = skip + 1

      res.render("admin/category", {
         categories,
         existmessage,
         successmessage,
         errormessage,
         editexistmessage,
         page,
         searchedcategoryname,
         startIndex,
         selectedpage
      });
   } catch (error) {
      console.error(error);
   }
};

const addcategory = async (req, res) => {
   try {
      const { categoryname, offer, expirydate } = req.body;   
      const file = req.file;
      const image = `/uploads/${ file.filename }`;
      const existcategory = await categoryschema.findOne({ categoryname:{$regex:categoryname,$options:"i"} });
      if(offer==0 && expirydate==""){
         const newCategorys=new categoryschema({
            categoryname,
            offer,
            image
         })
         await newCategorys.save()
         req.flash("success", "Category saved Successfully")
         return res.redirect("/admin/category");
      }
      if (existcategory) {
         req.flash('exist', "Category is already Exist")
         res.redirect('/admin/category')
      } else {
         const newcategory = new categoryschema({
            categoryname,
            offer,
            expiry_date: expirydate,
            image
         });
         await newcategory.save();
         req.flash("success", "Category saved Successfully")
         return res.redirect("/admin/category");
      }
   } catch (error) {
      req.flash('error', "An Error Occurred")
      res.redirect('/admin/category')
   }
};
const editcategory = async (req, res) => {
   try {
      const { categoryname, editid,Offer,expirydate } = req.body;
      const file = req.file
      const existTitle = await categoryschema.findOne({ _id: { $ne: editid },categoryname:{$regex:categoryname,$options:"i"} })
      if (existTitle) {
         req.flash('editexist', "Category Is Already Exist")
         res.redirect('/admin/category')
      } else {
         if (!file) {
            await categoryschema.findByIdAndUpdate({ _id: editid }, { categoryname,offer:Offer,expiry_date:expirydate })
            req.flash('success', "Updated Successfully");
            res.redirect('/admin/category');
         } else {
            const image = `/uploads/${ file.filename }`
            await categoryschema.findByIdAndUpdate({ _id: editid }, { categoryname, image,offer:Offer,expiry_date:expirydate })
            req.flash('success', "Category Updated Successfully");
            return res.redirect('/admin/category');
         }
      }

   }
   catch (error) {
      console.error("Error:", error);
      req.flash('error', "An error occurred");
      return res.redirect('/admin/category');
   }
};

const hidecategory = async (req, res) => {
   try {
      const { hideid } = req.body
      await categoryschema.findByIdAndUpdate({ _id: hideid }, { isdeleted: true })
      req.flash("success", "Category Hide successfully")
      res.redirect("/admin/category")
   } catch (error) {
      req.flash("error", "An Error Occured")
      res.redirect("/admin/category")
   }
}
const unhidecategory = async (req, res) => {
   try {
      const { unhideid } = req.body
      await categoryschema.findByIdAndUpdate({ _id: unhideid }, { isdeleted: false })
      req.flash("success", "Category Unhide successfully")
      res.redirect("/admin/category")
   } catch (error) {
      req.flash("error", "An Error Occured")
      res.redirect("/admin/category")
   }
}
const deletecategory = async (req, res) => {
   try {
      const { deleteid } = req.body
      await categoryschema.findByIdAndDelete({ _id: deleteid })
      req.flash("success", "Category Deleted successfully")
      res.redirect("/admin/category")
   } catch (error) {
      req.flash("error", "An Error Occured")
      res.redirect("/admin/category")
   }
}

module.exports = {
   addcategory, category, editcategory, hidecategory, unhidecategory, deletecategory
}
