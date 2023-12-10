const Service=require("../../models/User/Service")
const cloudinary = require('../../Middleware/Cloudinary')



const handleServiceAdding = async (req, res) => {
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
    const newService=new Service({
     name,
     photo: photoUpload.secure_url

    })
    await newService.save()
    return res.status(200).json({ success: true, message: "Service added successfully." });
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }
};



const handleFindService = async (req, res) => {
  try { 
    const allServiceData=await Service.find()
    res.json({success:true,allServiceData})
} catch (error) {
    res.status(400).json({ error: error.message })
}
};
 


const handleBlockService = async (req, res) => {
  try {
    const id= req.query.id
    await Service.findByIdAndUpdate({_id:id},{$set:{IsBlocked:true}})
    res.json({success:true,messege:" Service blocked successfully"})
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
};



const handleUnblockService = async (req, res) => {
  try {
    const id= req.query.id
    await Service.findByIdAndUpdate({_id:id},{$set:{IsBlocked:false}})
    res.json({success:true,messege:" Service blocked successfully"})
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
};


const handleDeleteService = async (req, res) => {
  try {
    const id = req.query.id;
    const deletedService = await Service.findByIdAndDelete(id);

    if (!deletedService) {
      return res
        .status(404)
        .json({ success: false, message: "Service not found" });
    }

    return res.json({
      success: true,
      message: "Service deleted successfully",
    });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
};
module.exports = {
  handleServiceAdding,
  handleFindService,
  handleBlockService,
  handleUnblockService,
  handleDeleteService
};
