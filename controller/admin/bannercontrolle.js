
const bannerschema = require("../../model/bannerschema")

const banner = async (req, res) => {
   try {
      const searchedbannername = req.query.banner || ''; 
      const selectedpage = Number(req.query.pagenumber) || 1; 
      const limit = 5; 
      const skip = (selectedpage - 1) * limit; 
      const searchFilter = searchedbannername
         ? { title: { $regex: searchedbannername, $options: 'i' } }
         : {};
      const totaldata = await bannerschema.countDocuments(searchFilter);
      const page = Math.ceil(totaldata / limit);
      const banners = await bannerschema.find(searchFilter).skip(skip).limit(limit);
      const startIndex = skip + 1

      const existmessage = req.flash("exist")
      const successmessage = req.flash("success")
      const errormessage = req.flash("error")
      const editexistmessage = req.flash('editexist')
      res.render('admin/banner', { banners, existmessage, successmessage, errormessage, editexistmessage, searchedbannername, page, startIndex,selectedpage })
   } catch (error) {
      console.log(error)
   }
}
const addbanner = async (req, res) => {
   try {
      const { title } = req.body;
      const file = req.file;

      if (!file) {
         req.flash('error', 'Please upload a valid image file');
         return res.redirect('/admin/banner');
      }

      const image = `/uploads/${ file.filename }`;

      const existTitle = await bannerschema.findOne({ title:{$regex:title,$options:"i"} });
      if (existTitle) {
         req.flash('exist', "Banner already exists");
         return res.redirect('/admin/banner');
      }

      const newBanner = new bannerschema({ image, title });
      await newBanner.save();

      req.flash('success', "Banner added successfully");
      res.redirect('/admin/banner');
   } catch (error) {
      console.error(error);
      req.flash('error', "An error occurred while adding the banner");
      res.redirect('/admin/banner');
   }
};


const editbanner = async (req, res) => {
   try {
      const { editid, title } = req.body
      const file = req.file
      const existtitle = await bannerschema.findOne({ _id: { $ne: editid },title:{$regex:title,$options:"i"} })
      if (existtitle) {
         req.flash('editexist', "Banner Is Already Exist")
         res.redirect('/admin/banner')
      } else {
         if (!file) {
            await bannerschema.findByIdAndUpdate({ _id: editid }, { title })
            req.flash('success', "Banner Updated Exist")
            res.redirect('/admin/banner')
         } else {
            const image = `/uploads/${ file.filename }`
            await bannerschema.findByIdAndUpdate({ _id: editid }, { title, image })
            req.flash('success', "Banner Updated Exist")
            res.redirect('/admin/banner')
         }

      }

   } catch {
      req.flash('error', "An Error Occured")
      res.redirect('/admin/banner')
   }
};


const blockbanner = async (req, res) => {
   try {
      const { hideid } = req.body
      await bannerschema.findByIdAndUpdate({ _id: hideid }, { is_blocked: true })
      req.flash('success', 'Banner Hide Successfully')
      res.redirect('/admin/banner')
   } catch (error) {
      req.flash('error', 'An Error Occurred')
      res.redirect('/admin/banner')
   }
}
const unblockbanner = async (req, res) => {
   try {
      const { unhideid } = req.body
      await bannerschema.findByIdAndUpdate({ _id: unhideid }, { is_blocked: false })
      req.flash('success', 'Banner Unhide Successfully')
      res.redirect('/admin/banner')
   } catch (error) {
      req.flash('error', 'An Error Occured')
      res.redirect('/admin/banner')
   }
};
const deletebanner = async (req, res) => {
   try {
      const { deleteid } = req.body
      await bannerschema.findByIdAndDelete({ _id: deleteid })
      req.flash('success', 'Banner Deleted Successfully')
      res.redirect('/admin/banner')
   } catch (error) {
      req.flash('error', 'An Error Occured')
      res.redirect('/admin/banner')
   }
}

module.exports = {
   banner, addbanner, editbanner, blockbanner, unblockbanner, deletebanner
}


