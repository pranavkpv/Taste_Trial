const rateschema = require('../../model/rateschema')
const foodschema = require('../../model/foodschema')
const hotelschema = require('../../model/hotelschema')
const varientschema = require('../../model/varientschema')

const rate = async (req, res) => {
  try {
    const successmessage = req.flash('success')
    const errormessage = req.flash('error')
    const existmessage = req.flash('exist')
    const questionmessage = req.flash('question')
    const hotels = await hotelschema.find({})
    const foods = await foodschema.find({})
    const varients = await varientschema.find({})
    const ratecollections = await rateschema.aggregate([
      {
        $lookup: {
          from: "hotels",
          localField: "hotel_id",
          foreignField: "_id",
          as: "hotelDetails"
        }
      },
      {
        $lookup: {
          from: "foods",
          localField: "food_id",
          foreignField: "_id",
          as: "foodDetails"
        }
      },
      {
        $lookup: {
          from: "varients",
          localField: "varient_id",
          foreignField: "_id",
          as: "varientDetails"
        }
      }
    ]);
    res.render('admin/rate', {
      successmessage, errormessage, existmessage, questionmessage,
      hotels, foods, varients, ratecollections
    })
  } catch (error) {
    console.log(error)
    req.flash('error', "An Error Occured")
    res.redirect('/admin/rate')
  }
}

const addrate = async (req, res) => {
  try {
    const { hotel_id, food_id, varient_id, rate, gst_per, delivery_per, packing_per, delivery_time, stock } = req.body
    const [file1,file2,file3] = req.files
    const existdata = await rateschema.findOne({ hotel_id, food_id, varient_id })
    if (existdata) {
      req.flash('exist', "Rate Already input")
      res.redirect('/admin/rate')
    } else {
      if (!file1 || !file2 || !file3) {
        req.flash('question', "Please Upload 3 images")
        res.redirect('/admin/rate')
      } else {
        const images = [`/uploads/${file1.filename}`,`/uploads/${file2.filename}`,`/uploads/${file3.filename}`]
        const files=[file1.filename,file2.filename,file3.filename]
        const newdata = new rateschema({
          hotel_id,
          food_id,
          varient_id,
          rate,
          gst_per,
          delivery_per,
          packing_per,
          delivery_time,
          stock,
          images,
          files
        })
        newdata.save()
        req.flash('success', "Data Saved Successfully")
        res.redirect('/admin/rate')
      }
    }
  } catch (error) {
    console.log(error)
    req.flash('error', "An Error Occurred")
    res.redirect('/admin/rate')
  }
}


const editrate = async (req, res) => {
  try {
    const {
      hotel_id,
      food_id,
      varient_id,
      rate,
      gst_per,
      delivery_per,
      packing_per,
      delivery_time,
      editid,
      stock,editfirstfilename,editsecondfilename,editthirdfilename
    } = req.body;
    console.log(req.body)
    const [file1,file2,file3] = req.files;
    const files=[editfirstfilename,editsecondfilename,editthirdfilename]
    const existfiles=await rateschema.findById({_id:editid},{files:1,_id:0})
    let i;
    for( i=0;i<files.length;i++){
      if(existfiles.files[i] !== files[i]){
        existfiles.files.splice(i,1)
        files.splice(i,1)
        i--
      }
    }
    for(let j=0;j<req.files.length;j++){
      existfiles.files.push(req.files[j].filename)
    }
    console.log(existfiles)
    const images=[`/uploads/${existfiles.files[0]}`,`/uploads/${existfiles.files[1]}`,`/uploads/${existfiles.files[2]}`]
    req.flash('success',"Data Edited Successfully")
    res.redirect('/admin/rate')
    await rateschema.findByIdAndUpdate({_id:editid},{
      hotel_id,
      food_id,
      varient_id,
      rate,
      gst_per,
      delivery_per,
      packing_per,
      delivery_time,
      stock,
      images,
      files:existfiles.files

    })

   
    
}
  catch (error) {
    console.error('Error in editrate function:', error);
    req.flash('error', 'An Error Occurred');
    res.redirect('/admin/rate');
  }
}






module.exports = { rate, addrate, editrate }