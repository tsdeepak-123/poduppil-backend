const Project = require("../../models/Admin/ProjectModel");
const cloudinary = require("../../Middleware/Cloudinary");
const Labour = require("../../models/Admin/LabourModal");
const mongoose = require("mongoose");

// This function handles Project Adding to database, taking in a request (req) and a response (res) as parameters.

const handleProjectAdding = async (req, res) => {
  try {
    const {
      projectnumber,
      name,
      date,
      status,
      upnext,
      pending,
      notes,
      supervisorname,
    } = req.body;

    if (
      projectnumber &&
      name &&
      date &&
      status &&
      upnext &&
      pending &&
      notes &&
      supervisorname
    ) {
      const ProjectExist = await Project.findOne({ projectnumber });
      if (ProjectExist) {
        res.json({
          success: false,
          messege: "project already exist.Please check project List",
        });
      } else {
        const newProject = new Project({
          projectnumber,
          name,
          date,
          status,
          upnext,
          pending,
          notes,
          supervisorname,
        });

        await newProject.save();
        res
          .status(200)
          .json({ success: true, messege: "Project added successfully" });
      }
    } else {
      res.json({ success: false, messege: "All fields must be field " });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
// ................................... Project Editing ..................................

const handleProjectEditing = async (req, res) => {
  try {
    const id = req.params.id;

    if (
      !req.body.name ||
      !req.body.date ||
      !req.body.status ||
      !req.body.upnext ||
      !req.body.pending ||
      !req.body.notes ||
      !req.body.supervisorname ||
      !req.body.projectnumber
    ) {
      return res
        .status(400)
        .json({ success: false, messege: "All fields must be field " });
    }

    const updatedProject = await Project.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true }
    );

    if (!updatedProject) {
      return res.status(404).json({ error: "Project not found" });
    }

    res
      .status(200)
      .json({ success: true, messege: "Project Updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

//   ................................... listing all projects details..................................

const ProjectList = async (req, res) => {
  try {
    const FindProject = await Project.find({ isCompleted: req.query.status });
    if (!FindProject) {
      res.json({ success: false, messege: "cant find Project details " });
    }
    res.status(200).json({ FindProject, success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

//...................project single view based on id ........................

const ProjectListById = async (req, res) => {
  try {
    const id = req.query.id;
    const FindProject = await Project.find({ _id: id });
    if (!FindProject) {
      res.json({ success: false, messege: "cant find Project details " });
    }
    res.status(200).json({ FindProject, success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

//Here handle the project photos aading

const handlePhotoAdding = async (req, res) => {
  try {
    const projectId = req.query.projectId;
    const findProject = await Project.findById(projectId)
    if (!findProject) {
      return res.json({
        success: false,
        message: "Can't find project",
        success: false,
      });
    }

    if (!req.files || !req.files.photos || req.files.photos.length === 0) {
      return res.json({
        success: false,
        message: "At least one photo must be uploaded.",
      });
    }

    const photoUrls = [];

    // Upload each photo to Cloudinary and store the secure URLs
    for (const photo of req.files.photos) {
      const photoUpload = await cloudinary.uploader.upload(photo.path);
      if (!photoUpload.secure_url) {
        return res.json({
          success: false,
          message: "Failed to upload photo",
        });
      }
      photoUrls.push(photoUpload.secure_url);
    }

    // Update the project's photos array with the new photo URLs
    await Project.updateOne(
      { _id: projectId },
      { $push: { photos: { $each: photoUrls } } }
    );

    res.json({ success: true, message: "Photos uploaded successfully." });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

const handleCompletedProjects = async (req, res) => {
  try {
    const id = req.query.id;
    await Project.findByIdAndUpdate(
      { _id: id },
      { $set: { isCompleted: true } }
    );
    res.json({ success: true, messege: "Project status updated successfully" });
  } catch (error) {
  }
};

//....................... project payment handling controller .....................

const handlepayment = async (req, res) => {
  try {
    const id = req.query.id;
    const { date, payment, amount } = req.body;
    if (date && payment && amount && id) {
      const project = await Project.findById(id);

      if (!project) {
        return res
          .status(404)
          .json({ success: false, message: "Project not found" });
      }

      const paymentEntry = {
        date,
        amount,
        payment,
      };


      project.projectPayment.push(paymentEntry);
      await project.save();

      return res
        .status(200)
        .json({ success: true, message: "payment entry added successfully" });
    } else {
      res.json({ success: false, message: "All fields required" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

//--------------------get all project recieved cash------------------------//

const handleRecievedCash = async (req, res) => {
  try {
    const totalReceived = await Project.aggregate([
      {
        $unwind: "$projectPayment",
      },
      {
        $group: {
          _id: "$_id",
          projectName: { $first: "$name" },
          totalAmountReceived: { $sum: "$projectPayment.amount" },
        },
      },
    ]);

    if (totalReceived.length > 0) {
      return res.json({ totalAmountReceived: totalReceived });
    } else {
      return res.status(404).json({ message: "No projects found" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

//--------------------get all project recieved cash------------------------//

const handleRecievedCashByProject = async (req, res) => {
  try {
    const projectId = req.query.id;
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    const paymentRecords = project.projectPayment;
    return res.status(200).json({paymentRecords });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  handleProjectAdding,
  handleProjectEditing,
  ProjectList,
  ProjectListById,
  handlePhotoAdding,
  handleCompletedProjects,
  handlepayment,
  handleRecievedCash,
  handleRecievedCashByProject,
};
