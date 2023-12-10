const Interior=require("../../models/User/Interior")
const cloudinary = require('../../Middleware/Cloudinary')



const handleInteriorAdding = async (req, res) => {
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
    const newInterior=new Interior({
     name,
     photo: photoUpload.secure_url

    })
    await newInterior.save()
    return res.status(200).json({ success: true, message: "Interior added successfully." });
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }
};



const handleFindInterior = async (req, res) => {
  try { 
    const allInteriorData=await Interior.find()
    res.json({success:true,allInteriorData})
} catch (error) {
    res.status(400).json({ error: error.message })
}
};
 


const handleBlockInterior = async (req, res) => {
  try {
    const id= req.query.id
    await Interior.findByIdAndUpdate({_id:id},{$set:{IsBlocked:true}})
    res.json({success:true,messege:" Interior blocked successfully"})
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
};



const handleUnblockInterior = async (req, res) => {
  try {
    const id= req.query.id
    await Interior.findByIdAndUpdate({_id:id},{$set:{IsBlocked:false}})
    res.json({success:true,messege:" Interior blocked successfully"})
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
};


const handleDeleteInterior = async (req, res) => {
  try {
    const id = req.query.id;
    const deletedInterior = await Interior.findByIdAndDelete(id);

    if (!deletedInterior) {
      return res
        .status(404)
        .json({ success: false, message: "Interior not found" });
    }

    return res.json({
      success: true,
      message: "Interior deleted successfully",
    });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
};
module.exports = {
  handleInteriorAdding,
  handleFindInterior,
  handleBlockInterior,
  handleUnblockInterior,
  handleDeleteInterior
};
