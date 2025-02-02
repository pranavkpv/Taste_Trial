const categoryschema = require('../../model/categoryschema')
const userload = async (req, res) => {
   try {
      const successsavemessage =req.flash('successsavemessage')
      res.render('user/load',{successsavemessage});
   } catch (error) {
      console.log("Error:", error);
      res.status(500).json({ message: "Internal server error" });
   }
};


module.exports={userload}