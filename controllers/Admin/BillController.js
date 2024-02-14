const Bill=require("../../models/Admin/BillModel")
const cloudinary = require('../../Middleware/Cloudinary')



// This function handles bill Adding to database, taking in a request (req) and a response (res) as parameters.

const handleBillAdding = async (req, res) => {
  try {
    const {
      name,
      date,
      amount,
      status,
      paid,
      pending,
      paidby,
      payment,
    } = req.body;

    if (
      name &&
      date &&
      amount &&
      status &&
      paid &&
      pending &&
      paidby &&
      payment
    ) {
      let photoUrl;
      if (req.files && req.files.photo) {
        const photoUpload = await cloudinary.uploader.upload(
          req.files.photo[0].path
        );

        if (!photoUpload.secure_url) {
          return res.json({
            success: false,
            message: "Failed to upload photo",
          });
        }

        photoUrl = photoUpload.secure_url;
      }

      const isPaid = pending === 0 ? true : false;
      const newBill = new Bill({
        name,
        date,
        amount,
        status,
        paid,
        pending,
        paidby,
        payment,
        photo: photoUrl,
        isPaid: isPaid,
      });

      await newBill.save();
      return res
        .status(200)
        .json({ success: true, message: "Bill added successfully." });
    } else {
      return res.json({
        success: false,
        message: "All fields must be filled.",
      });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};



  // This function handles Labour Details pic from data base, taking in a request (req) and a response (res) as parameters.

  const handleBillDetails=async (req,res)=>{
    try { 
        const allBillData=await Bill.find({isPaid:req.query.status})
        res.json({success:true,allBillData})
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}


const handleBillSingleView=async(req,res)=>{
  try {
    const id=req.query.id
    const billData=await Bill.find({_id:id})
    if(!billData){
      res.json({message:"bill not finded",success:true})
    }
    res.json({message:"bill finded",success:true,billData})
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}


const handleCompletedBills=async(req,res)=>{
  try {
    const id= req.query.id
    await Bill.findByIdAndUpdate({_id:id},{$set:{isPaid:true}})
    res.json({success:true,messege:"bill status updated successfully"})
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}



const handleDeleteBill = async (req, res) => {
  try { 
    const id = req.query.id;
    const deletedBill = await Bill.findByIdAndDelete(id);

    if (!deletedBill) {
      return res
        .status(404)
        .json({ success: false, message: "Bill not found" });
    }

    return res.json({
      success: true,
      message: "Bill deleted successfully",
    });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
};


const handleBillEditing = async (req, res) => {
  try {
   
    const id = req.params.id;
    console.log(req.files && req.files.photo);

          // Update photo if it exists in the request
          if (req.files && req.files.photo) {
            const photoUpload = await cloudinary.uploader.upload(req.files.photo[0].path);
            
            if (!photoUpload.secure_url) {
              return res.json({
                success: false, 
                message: "Failed to upload photo",
              });
            }
      
            // Add the updated photo URL to req.body
            req.body.photo = photoUpload.secure_url;
          }

    if (
      !req.body.name ||
      !req.body.date ||
      !req.body.amount ||
      !req.body.status ||
      !req.body.paid||
      !req.body.pending ||
      !req.body.paidby ||
      !req.body.payment
    ) {
      return res
        .status(400)
        .json({ success: false, message: "All fields must be filled " });
    }

    const updatedBill = await Bill.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true }
    );

    if (!updatedBill) {
      return res.status(404).json({ error: "Bill not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "Bill Updated successfully" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Server error" });
  }
};


  module.exports={handleBillAdding,handleBillDetails,handleBillSingleView,handleCompletedBills,handleDeleteBill,handleBillEditing}