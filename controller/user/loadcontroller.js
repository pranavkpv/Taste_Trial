const categoryschema = require('../../model/categoryschema')

const userload=async(req,res)=>{
   try {
      const categories = await categoryschema.find({isdeleted:false})
      res.render('user/load',{categories})
   } catch (error) {
      console.log(error)
   }
}
module.exports={userload}