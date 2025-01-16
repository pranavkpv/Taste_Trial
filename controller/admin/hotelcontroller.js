const hotelschema = require('../../model/hotelschema')
const foodschema = require('../../model/foodschema')
const hotel = async (req, res) => {
   try {
      const searchedhotelname = req.query.hotel || ''; // Get the search query
            const selectedpage = Number(req.query.pagenumber) || 1; // Get the page number
            const limit = 5; // Number of categories per page
            const skip = (selectedpage - 1) * limit; // Calculate the skip value
            
            // Search filter
            const searchFilter = searchedhotelname 
               ? { hotelname: { $regex: searchedhotelname, $options: 'i' } } 
               : {};
      
            // Get filtered data count
            const totaldata = await hotelschema.countDocuments(searchFilter);
            const page = Math.ceil(totaldata / limit);
      
            // Get filtered and paginated data
            const hotels = await hotelschema.find(searchFilter).skip(skip).limit(limit);
            const startIndex=skip+1
 
      const existdatamessage = req.flash('exist')
      const saveddatamessage = req.flash('success')
      const errormessage = req.flash("error")
      const editexistmessage = req.flash('editexist')
      const foods = await foodschema.find({})
      res.render("admin/hotel", { hotels,foods, existdatamessage, 
         saveddatamessage,errormessage,editexistmessage,page,searchedhotelname,startIndex})
   } catch (error) {
      console.log(error)
      req.flash('error', "An Error Occured")
      res.redirect('/admin/hotel')
   }
}
const addHotel = async (req, res) => {
   try {
      const { hotelname, hoteladdress, contactnumber, alternativenumber ,foodname} = req.body;
      const file = req.file;
      const foodIds=await foodschema.find({foodname:{$in:foodname}},{_id:1})
      const foodIdArray=foodIds.map((value=>value._id))
      const existingHotel = await hotelschema.findOne({ hotelname });
      if (existingHotel) {
         req.flash("exist", "Hotel Already Exists");
         return res.redirect('/admin/hotel');
      }

      // Save new hotel
      const image = `/uploads/${file.filename}`;
      const newHotel = new hotelschema({
         hotelname,
         hoteladdress,
         contact_no:contactnumber,
         alternative_no:alternativenumber,
         image,
         food_items:foodIdArray
      });

      await newHotel.save();
      req.flash('success', "Hotel saved successfully");
      return res.redirect('/admin/hotel');

   } catch (error) {
      console.error("Error adding hotel:", error);
      req.flash('error', "An error occurred");
      return res.redirect('/admin/hotel');
   }
};
           
const editHotel = async (req, res) => {
   try {
      const { hotelname,hoteladdress,contactnumber,alternativenumber, editid,foodname } = req.body;
      const file = req.file;
         const existTitle= await hotelschema.find({_id:{$ne:editid}})
         const countDocument=await hotelschema.countDocuments()-1
         let existvalue=0;
         for(let i=0;i<countDocument;i++){
            if(existTitle[i].hotelname==hotelname){
               existvalue++
            }
         }
         if(existvalue>0){
            req.flash('editexist', "Hotel Already Exist");
            res.redirect('/admin/hotel');
         }
         else{
            if(!file){
               await hotelschema.findByIdAndUpdate({_id:editid},{hotelname,hoteladdress,contact_no:contactnumber,alternative_no:alternativenumber,food_items:foodname})
               req.flash('success', "Hotel Updated Successfully");
               res.redirect('/admin/hotel');
            }else{
               const image = `/uploads/${file.filename}`
               await hotelschema.findByIdAndUpdate({_id:editid},{hotelname,image,hoteladdress,contact_no:contactnumber,alternative_no:alternativenumber})
               req.flash('success', "Hotel Updated Successfully");
               return res.redirect('/admin/hotel');
            }
            
         }
      } catch (error) {
      console.error("Error:", error);
      req.flash('error', "An error occurred");
      return res.redirect('/admin/hotel');
   }
};
const blockHotel = async (req, res) => {
   try {
      const { hideid } = req.body
      await hotelschema.findByIdAndUpdate({ _id: hideid }, { is_blocked: true })
      req.flash("success", "Hotel Is Hide successfully")
      res.redirect("/admin/hotel")
   } catch (error) {
      req.flash("error", "An Error Occured")
      res.redirect("/admin/hotel")
   }
}
const unblockHotel = async (req, res) => {
   try {
      const { unhideid } = req.body
      await hotelschema.findByIdAndUpdate({ _id: unhideid }, { is_blocked: false })
      req.flash('success', "Hotel Is Unhide Successfully")
      res.redirect("/admin/hotel")
   } catch (error) {
      req.flash("error", "An Error Occured")
      res.redirect("/admin/hotel")
   }
}

const deleteHotel = async(req,res)=>{
   try {
      const {deleteid}=req.body
      await hotelschema.findByIdAndDelete({_id:deleteid})
      req.flash('success', "Hotel Is Deleted Successfully")
      res.redirect("/admin/hotel")
   } catch (error) {
      req.flash("error", "An Error Occured")
      res.redirect("/admin/hotel")
   }
}



module.exports={
   addHotel, editHotel, hotel, blockHotel, unblockHotel,deleteHotel
}