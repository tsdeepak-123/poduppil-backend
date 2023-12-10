const Owner=require("../../models/User/Owner")
const cloudinary = require('../../Middleware/Cloudinary')



const handleOwnerAdding = async (req, res) => {
  try{
    const {name} =req.body
    if (!req.files|| !req.files.photo||!name) {
      return res.json({
        success: false,
        message: "All fields required",
      });
    }
    const photoUpload = await cloudinary.uploader.upload(req.files.photo[0].path);
    if (!photoUpload.secure_url) {
      return res.json({
        success: false,
        message: "Failed to upload photo",
      });
    }
    const newOwner=new Owner({
     name,
     photo: photoUpload.secure_url

    })
    await newOwner.save()
    return res.status(200).json({ success: true, message: "Owner added successfully." });
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }
};



const handleFindOwner = async (req, res) => {
  try { 
    const allOwnerData=await Owner.find()
    res.json({success:true,allOwnerData})
} catch (error) {
    res.status(400).json({ error: error.message })
}
};
 


const handleBlockOwner = async (req, res) => {
  try {
    const id= req.query.id
    await Owner.findByIdAndUpdate({_id:id},{$set:{IsBlocked:true}})
    res.json({success:true,messege:" Owner blocked successfully"})
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
};



const handleUnblockOwner = async (req, res) => {
  try {
    const id= req.query.id
    await Owner.findByIdAndUpdate({_id:id},{$set:{IsBlocked:false}})
    res.json({success:true,messege:" Owner blocked successfully"})
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
};


const handleDeleteOwner = async (req, res) => {
  try {
    const id = req.query.id;
    const deletedOwner = await Owner.findByIdAndDelete(id);

    if (!deletedOwner) {
      return res
        .status(404)
        .json({ success: false, message: "Owner not found" });
    }

    return res.json({
      success: true,
      message: "Owner deleted successfully",
    });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
};
module.exports = {
  handleOwnerAdding,
  handleFindOwner,
  handleBlockOwner,
  handleUnblockOwner,
  handleDeleteOwner
};
