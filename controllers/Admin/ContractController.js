const Project = require("../../models/Admin/ProjectModel");
const contract = require("../../models/Admin/ContractModel");
const cloudinary = require("../../Middleware/Cloudinary");
const mongoose = require("mongoose");

//  .............................. add new  Contract....................................................

const handleAddContract = async (req, res) => {
  try {
    const {
      projectname,
      Contractwork,
      totallabour,
      Contractorname,
      totalhelper,
      Details,
      phone,
      date,
      Paymentdetails,
      status,
      Amount,
    } = req.body;

    if (
      projectname &&
      Contractwork &&
      totallabour &&
      Contractorname &&
      totalhelper &&
      Details &&
      phone &&
      date &&
      Paymentdetails &&
      status &&
      Amount
    ) {
      const FindProject = await Project.findOne({ name: projectname });
      if (!FindProject) {
        res.json({
          success: false,
          messege:
            "cant find project based on project name and number enter proper number and name of the project ",
        });
      } else {
        const newContract = new contract({
          project: FindProject._id,
          projectname,
          Contractwork,
          totallabour,
          Contractorname,
          totalhelper,
          Details,
          phone,
          date,
          Paymentdetails,
          status,
          Amount,
        });
        await newContract.save();
        res
          .status(200)
          .json({ success: true, messege: "Project added successfully" });
      }
    } else {
      res.json({ success: false, messege: "All fields must be field " });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

//   ................................... listing all contract details..................................

const ContractList = async (req, res) => {
  try {
    const FindContract = await contract
      .find({ isCompleted: req.query.status })
      .populate("project");
    if (!FindContract) {
      res.json({ success: false, messege: "cant find contract details " });
    }
    res.status(200).json({ FindContract, success: true });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

//...................contractList single view based on id ........................

const ContractListById = async (req, res) => {
  try {
    const id = req.query.id;
    const FindContract = await contract
      .findOne({ _id: id })
      .populate("project");
    if (!FindContract) {
      res.json({ success: false, messege: "cant find contract details " });
    }
    res.status(200).json({ FindContract, success: true });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

//..........................Contract edit ..........................................

const handleEditContract = async (req, res) => {
  try {
    const id = req.query.id;
    const {
      projectname,
      Contractwork,
      totallabour,
      Contractorname,
      totalhelper,
      Details,
      phone,
      date,
      Paymentdetails,
      status,
      Amount,
    } = req.body;

    const updateFields = {};

    if (projectname) {
      const FindProject = await Project.findOne({ name: projectname });

      if (FindProject) {
        updateFields.project = FindProject._id;
        updateFields.projectname = FindProject.name;
      } else {
        return res.status(404).json({ message: "Can't find project details" });
      }
    }

    if (Contractwork) updateFields.Contractwork = Contractwork;
    if (totallabour) updateFields.totallabour = totallabour;
    if (Contractorname) updateFields.Contractorname = Contractorname;
    if (totalhelper) updateFields.totalhelper = totalhelper;
    if (Details) updateFields.Details = Details;
    if (phone) updateFields.phone = phone;
    if (date) updateFields.date = date;
    if (Paymentdetails) updateFields.Paymentdetails = Paymentdetails;
    if (status) updateFields.status = status;
    if (Amount) updateFields.Amount = Amount;

    const Findcontract = await contract.findById(id);

    if (!Findcontract) {
      return res
        .status(404)
        .json({ success: false, message: "Can't find contract details" });
    } else {
      Object.assign(Findcontract, updateFields);

      const savedContract = await Findcontract.save();

      res
        .status(200)
        .json({ message: "Edited successfully", contract: savedContract });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const handleCompletedContracts = async (req, res) => {
  try {
    const id = req.query.id;
    await contract.findByIdAndUpdate(
      { _id: id },
      { $set: { isCompleted: true } }
    );
    res.json({ success: true, messege: "Project status updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// .................................     workerCount adding  ..............................

const handleWorkerCount = async (req, res) => {
  try {
    const id = req.query.id;
    const { date, mainLabour, helpers } = req.body;

    if (date && mainLabour && helpers && id) {
      const Contract = await contract.findById(id);

      if (!Contract) {
        return res
          .status(404)
          .json({ success: false, message: "Contract not found" });
      }
      const formattedDate = new Date(date);
      const existingWorkerCount = Contract.workerCount.find(
        (entry) => entry.date.toString() == formattedDate.toString()
      );

      if (existingWorkerCount) {
        return res.status(400).json({
          success: false,
          message: "Already added in that date",
        });
      }

      const WorkerCount = {
        date,
        mainLabour,
        helpers,
      };
      Contract.workerCount.push(WorkerCount);
      await Contract.save();
      const UpdatedmainLabour =
        Number(Contract.totallabour) + Number(mainLabour);
      const Updatedhelpers = Number(Contract.totalhelper) + Number(helpers);
      await contract.findByIdAndUpdate(
        { _id: id },
        {
          $set: { totallabour: UpdatedmainLabour, totalhelper: Updatedhelpers },
        }
      );

      return res.status(200).json({
        success: true,
        message: "Worker count entry added successfully",
      });
    }

    res.json({ success: false, message: "All fields required" });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

//--------------------get labour count of singe contract------------------------//

const handleLabourCountById = async (req, res) => {
  try {
    const contractId = req.query.id;
    const contracts = await contract.findById(contractId);
    if (!contracts) {
      return res.status(404).json({ message: "contract not found" });
    }
    const LabourRecords = contracts.workerCount;
    return res.status(200).json({ LabourRecords });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};



const handleContractByProjectId=async(req,res)=>{
  try {
    const projectname=req.query.projectname;
    console.log(projectname);

    const allContractsById=await contract.find({projectname:projectname})
    console.log(allContractsById,"WORKKKKKKKKKKKK");
    res.json({success:true,message:"Contract with project name finded suuccessfully",allContractsById})
    
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = {
  handleAddContract,
  ContractList,
  ContractListById,
  handleEditContract,
  handleCompletedContracts,
  handleWorkerCount,
  handleContractByProjectId,
  handleLabourCountById,
};
