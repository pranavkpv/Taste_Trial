const walletschema=require('../../model/walletSchema')

const wallet=async(req,res)=>{
   try {
      const userid=req.session.user 
      const wallets=await walletschema.find({userId:userid}).lean()
      wallets.forEach(element => {
         const day = String(element.createdAt.getDate()).padStart(2,0); // Ensure 2 digits
         const month = String(element.createdAt.getMonth()+1 ).padStart(2,0); // Add 1 to month
         const year = element.createdAt.getFullYear();
         const formattedDate = `${day}-${month}-${year}`; // Add formattedDate field
         element.formattedCreatedAt=formattedDate
       }); 
       const sumofcredit=wallets.reduce((sum,element)=>{
         if(element.type=="Credit"){
            sum+=element.amount
         }
         return sum
       },0) 
       const sumofDebit=wallets.reduce((sum,element)=>{
         if(element.type==="Debit"){
            sum+=element.amount
         }
         return sum
       },0) 
       const balanceAmount=sumofcredit-sumofDebit
      res.render('user/wallet',{userid,searchmessage:"",searcheditemname :"",wallets,balanceAmount})
   } catch (error) {
      console.log(error)
   }
}


module.exports={wallet}