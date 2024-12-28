
const adminschema = require("../model/adminschema")
const userschema = require("../model/usershema")
const categoryschema = require("../model/categoryschema")
const foodschema = require("../model/foodschema")
const hotelschema = require("../model/hotelschema")
const bannerschema = require("../model/bannerschema")

const login = (req, res) => {
   res.render("admin/login")
}
const dashboard = (req, res) => {
   res.render("admin/dashboard")
}
const validLogin = async (req, res) => {
   try {
      const { username, password } = req.body
      const namevalidate = await adminschema.findOne({ username })
      const passwordvalidate = await adminschema.findOne({ password })
      if (namevalidate && passwordvalidate) {
         res.render("admin/dashboard")
      } else {
         res.render("admin/login", { message: "username or password is wrong please check" })
      }
   } catch (error) {

   }

}
const category = async (req, res) => {
   const categories = await categoryschema.find({})
   res.render("admin/category", { categories })
}

const addcategory = async (req, res) => {
   try {
      const { categoryname } = req.body;
      const file = req.file; // Access the uploaded file

      // Validate inputs
      if (!categoryname || !file) {
         return res.status(400).send("Category name and image are required.");
      }

      const image = `/uploads/${file.filename}`; // Store relative path

      // Check if category already exists
      const existcategory = await categoryschema.findOne({ categoryname: categoryname.trim() });
      if (existcategory) {
         return res.status(409).send("Category already exists."); // Use a conflict status and provide feedback
      }

      // Create a new category
      const newcategory = new categoryschema({
         categoryname: categoryname.trim(), // Trim spaces to avoid duplication
         image,
      });
      await newcategory.save();

      return res.redirect("/admin/category"); // Redirect after successful save
   } catch (error) {
      console.error("Error adding category:", error);
      res.status(500).send("Server Error");
   }
};


const editcategory = async (req, res) => {


}




const deletecategory = async (req, res) => {
   const { categoryname } = req.body
   await categoryschema.findOneAndUpdate({ categoryname }, { isdeleted: true })
   res.redirect("/admin/category")
}
const unblockcategory = async (req, res) => {
   const { categoryname } = req.body
   await categoryschema.findOneAndUpdate({ categoryname }, { isdeleted: false })
   res.redirect("/admin/category")
}



// usermanagement

const usermanagement = async (req, res) => {
   try {
      const users = await userschema.find({})
      res.render("admin/usermanagement", { users })

   } catch (error) {
      console.log(error)
   }
}
const adduser = async (req, res) => {
   try {
      const { firstname, lastname, phonenumber, email, password } = req.body
      const existuser = await userschema.findOne({ email })
      if (existuser) {
         res.redirect("/admin/usermanagement")
      } else {
         const newUser = new userschema({
            firstname,
            lastname,
            phonenumber,
            email,
            password
         })
         await newUser.save()
         res.redirect("/admin/usermanagement")
      }

   } catch (error) {
      console.log(error)
   }
}
const editUser = async (req, res) => {
   try {
      const { firstname, lastname, phonenumber, email, password, id } = req.body
      await userschema.findByIdAndUpdate({ _id: id }, { firstname, lastname, email, phonenumber, password })
      res.redirect("/admin/usermanagement")
   } catch (error) {
      console.log(error)
   }
}
const deleteUser = async (req, res) => {
   try {
      const { deleteid } = req.body
      await userschema.findByIdAndDelete({ _id: deleteid })
      res.redirect("/admin/usermanagement")
   } catch (error) {
      console.log(error)
   }
}
const blockUser = async (req, res) => {
   try {
      const { blockid } = req.body
      await userschema.findByIdAndUpdate({ _id: blockid }, { is_blocked: true })
      res.redirect("/admin/usermanagement")
   } catch (error) {
      console.log(error)
   }
}
const unblockUser = async (req, res) => {
   try {
      const { unblockid } = req.body
      await userschema.findByIdAndUpdate({ _id: unblockid }, { is_blocked: false })
      res.redirect("/admin/usermanagement")
   } catch (error) {
      console.log(error)
   }
}

// hotel management

const hotel = async (req, res) => {
   const hotels = await hotelschema.find({})
   res.render("admin/hotel", { hotels })
}
const addHotel = async (req, res) => {
   try {
      const { hotelname, hoteladdress, contact_no, alternative_no } = req.body;
      const file = req.file;

      if (!file) {
         return res.status(400).send('No image uploaded.');
      }

      const photo = `/uploads/${ file.filename }`;
      const existhotel = await hotelSchema.findOne({ hotelname });

      if (existhotel) {
         return res.status(400).send('Hotel already exists.');
      }

      const newHotel = new hotelschema({
         hotelname,
         hoteladdress,
         contact_no,
         alternative_no,
         photo,
      });

      await newHotel.save();
      return res.redirect('/admin/hotel');
   } catch (error) {
      console.error(error);
      return res.status(500).send('Server Error');
   }
};
const editHotel = async (req, res) => {
   const { id, hotelname, hotelAddress, contact_no, alternative_no } = req.body;
   await hotelschema.findByIdAndUpdate({ _id: id }, { $set: { hotelname, hoteladdress: hotelAddress, contact_no, alternative_no } })
   res.redirect("/admin/hotel")
}
const blockHotel = async (req, res) => {
   try {
      const { blockid } = req.body
      await hotelschema.findByIdAndUpdate({ _id: blockid }, { is_blocked: true })
      res.redirect("/admin/hotel")
   } catch (error) {
      console.log(error)
   }
}
const unblockHotel = async (req, res) => {
   try {
      const { unblockid } = req.body
      await hotelschema.findByIdAndUpdate({ _id: unblockid }, { is_blocked: false })
      res.redirect("/admin/hotel")
   } catch (error) {
      console.log(error)
   }
}
// foodmanagement

const food = async (req, res) => {
   try {
      const foods = await foodschema.find({})
      const categories = await categoryschema.find({})
      const hotels = await hotelschema.find({})
      res.render("admin/food", { foods, categories, hotels })
   } catch (error) {
      console.log(error)
   }
}

const addFood = async (req, res) => {
   try {
      const { foodname, categoryname, hotelname, rate, gst_per, delivery_charge, packing_charge, duration_time, is_veg } = req.body
      const newfoodDetails = new foodschema({
         foodname,
         category_id: categoryname,
         hotel_id: hotelname,
         rate,
         gst_per,
         delivery_charge,
         packing_charge,
         duration_time,
         is_veg
      })
      await newfoodDetails.save()
      res.redirect("/admin/food")
   } catch (error) {
      console.log(error)
   }
}

const editFood = async (req, res) => {
   try {
      const {foodname,categoryname,hotelname,rate,gst_per,delivery_charge,packing_charge,duration_time,id}=req.body
      const existfood = await foodschema.findOne({foodname})
      const existhotel = await foodschema.findOne({foodname},{hotelname})
      if(existfood && existhotel){
         res.redirect('/admin/food')
      }else{
         await foodschema.findByIdAndUpdate({_id:id},{foodname,categoryname,hotelname,rate,gst_per,delivery_charge,packing_charge,duration_time})
         res.redirect('/admin/food')
      }
   } catch (error) {
        console.log(error)
   }
}

const blockFood = async(req,res)=>{
   const {blockid}=req.body
   await foodschema.findByIdAndUpdate({_id:blockid},{is_blocked:true})
   res.redirect('/admin/food')
}

const unblockFood = async(req,res)=>{
   const {unblockid}=req.body
   await foodschema.findByIdAndUpdate({_id:unblockid},{is_blocked:false})
   res.redirect('/admin/food')

}

// bannermanagement
const banner=async(req,res)=>{
   res.render('admin/banner')
}
const addbanner = async (req, res) => {
   try {
      const { title } = req.body;
      const file = req.file;

      // Validate required fields
      if (!title || !file) {
         return res.status(400).send("Title and image are required.");
      }

      // Extract the file path
      const image = `/uploads/${file.filename}`;

      // Create and save the new banner
      const newbanner = new bannerschema({
         image,
         title: title.trim(), // Trim title to remove unnecessary whitespace
      });
      await newbanner.save();

      // Redirect to the banner page after successful save
      res.redirect('/admin/banner');
   } catch (error) {
      console.error("Error adding banner:", error);
      res.status(500).send("Server Error");
   }
};






module.exports = {
   login, validLogin, usermanagement, food, hotel, dashboard,
   addcategory, category, editcategory, deletecategory, addHotel, editHotel, unblockcategory,
   adduser, editUser, deleteUser, blockUser, unblockUser, blockHotel, unblockHotel, addFood,
   editFood,blockFood,unblockFood,banner,addbanner
}