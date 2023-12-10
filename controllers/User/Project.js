const Project=require("../../models/User/Project")
const cloudinary = require('../../Middleware/Cloudinary')



const handleProjectAdding = async (req, res) => {
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
    const newProject=new Project({
     name,
     photo: photoUpload.secure_url

    })
    await newProject.save()
    return res.status(200).json({ success: true, message: "Project added successfully." });
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }
};



const handleFindProject = async (req, res) => {
  try { 
    const allProjectData=await Project.find()
    res.json({success:true,allProjectData})
} catch (error) {
    res.status(400).json({ error: error.message })
}
};
 


const handleBlockProject = async (req, res) => {
  try {
    const id= req.query.id
    await Project.findByIdAndUpdate({_id:id},{$set:{IsBlocked:true}})
    res.json({success:true,messege:" Project blocked successfully"})
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
};



const handleUnblockProject = async (req, res) => {
  try {
    const id= req.query.id
    await Project.findByIdAndUpdate({_id:id},{$set:{IsBlocked:false}})
    res.json({success:true,messege:" Project blocked successfully"})
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
};


const handleDeleteProject = async (req, res) => {
  try {
    const id = req.query.id;
    const deletedProject = await Project.findByIdAndDelete(id);

    if (!deletedProject) {
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });
    }

    return res.json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
};
module.exports = {
  handleProjectAdding,
  handleFindProject,
  handleBlockProject,
  handleUnblockProject,
  handleDeleteProject
};
