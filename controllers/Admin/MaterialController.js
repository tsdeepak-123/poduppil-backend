const Careof = require("../../models/Admin/CareOfModel");
const Material = require("../../models/Admin/MaterialModel");
const Project = require("../../models/Admin/ProjectModel");
const Purchase = require("../../models/Admin/PurchaseModel");

//handle material adding here
const handleMaterialAdding = async (req, res) => {
  try {
    const { MaterialName } = req.body;

    const newMaterial = new Material({
      name: MaterialName,
    });

    await newMaterial.save();
    res.json({ success: true, messege: "Material added successfully" });
  } catch (error) {
    res.status(500).json({ messege: "internal server error" });
  }
};

//get full material list

const handleMaterialList = async (req, res) => {
  try {
    const allMaterials = await Material.find();
    // Material found
    res
      .status(200)
      .json({ success: true, message: "Materials found", allMaterials });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

//here purchase the materials

const handleMaterialPurchase = async (req, res) => {
  try {
    const { materials, projectname, date, careof } = req.body;
    const findProject = await Project.findOne({ name: projectname });
    if (!findProject) {
      return res.json({
        success: false,
        message: "Failed find project",
      });
    }

    const totalAmount = materials.reduce((acc, cur) => {
      return (acc += cur.total);
    }, 0);

    const newMaterial = new Purchase({
      project: findProject._id,
      projectname: findProject.name,
      TotalAmount: totalAmount,
      Material: materials,
      date: date,
      careof: careof,
    });

    await newMaterial.save();

    res.status(200).json({ sucess: true, messege: "Purchase bill added" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

//.......................PurchaseData   by id ...........................

const handlePurchaseById = async (req, res) => {
  try {
    const projectid = req.query.projectid;
    const PurchaseData = await Purchase.find({ project: projectid });
    if (!PurchaseData || PurchaseData.length === 0) {
      return res.json({ success: false, message: "No data found" });
    }

    res.json({
      success: true,
      message: "PurchaseData found successfully",
      PurchaseData,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

//............................handlePurchaseByDate ...........................

const handlePurchaseByDate = async (req, res) => {
  try {
    const date = req.query.date;
    const dateToFind = new Date(date + "T00:00:00.000+00:00");
    const projectid = req.query.id;

    const PurchaseData = await Purchase.find({
      project: projectid,
      date: {
        $gte: dateToFind,
        $lt: new Date(dateToFind.getTime() + 24 * 60 * 60 * 1000),
      },
    });

    if (!PurchaseData || PurchaseData.length === 0) {
      return res.json({ success: false, message: "No data found" });
    }

    res.json({
      success: true,
      message: "PurchaseData found successfully",
      PurchaseData,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

//.........................................

const handleMaterialTotal = async (req, res) => {
  try {
    const materialData = await Purchase.find();
    if (materialData.length > 0) {
      const projectTotals = materialData.reduce((acc, material) => {
        const projectId = material.project.toString();
        if (!acc[projectId]) {
          acc[projectId] = {
            projectname: material.projectname,
            totalAmount: 0,
          };
        }
        acc[projectId].totalAmount += material.TotalAmount;

        return acc;
      }, {});
      const projectTotalsArray = Object.values(projectTotals);
      return res.json({
        success: true,
        message: "Material data found",
        projectTotals: projectTotalsArray,
      });
    }

    return res.json({ success: false, message: "No data found" });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

//-------------------------------------------------------------

const handlePurchaseByCareOf = async (req, res) => {
  try {
    const PurchaseList = await Purchase.aggregate([
      {
        $unwind: "$Material",
      },
      {
        $sort: { date: 1 },
      },

      {
        $group: {
          _id: "$Material.careof",
          project: { $first: "$project" },
          TotalAmount: { $sum: "$Material.total" },
          materialList: {
            $push: {
              name: "$Material.name",
              careof: "$Material.careof",
              quantity: "$Material.quantity",
              total: "$Material.total",
              baseRate: "$Material.baseRate",
              date: "$date",
              projectname: "$projectname",
            },
          },
        },
      },
    ]);
    return res.status(200).json({ PurchaseList });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

//handle CareOf adding here
const handleCareOfAdding = async (req, res) => {
  try {
    const { careof } = req.body;

    const newCareOf = new Careof({
      name: careof,
    });

    await newCareOf.save();
    res.json({ success: true, messege: "CareOf added successfully" });
  } catch (error) {
    res.status(500).json({ messege: "internal server error" });
  }
};

//get full careof list

const handleCareOfList = async (req, res) => {
  try {
    const allCareOfs = await Careof.find();
    // careof found
    res
      .status(200)
      .json({ success: true, message: "careofs found", allCareOfs });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
//delete care of

const handleDeleteCareOf = async (req, res) => {
  try { 
    const id = req.query.id;
    const deletedCareOf = await Careof.findByIdAndDelete(id);

    if (!deletedCareOf) {
      return res
        .status(404)
        .json({ success: false, message: "CareOf not found" });
    }

    return res.json({
      success: true,
      message: "CareOf deleted successfully",
    });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
};

//delete purchase bill

const handleDeletePurchaseBill = async (req, res) => {
  try {
    console.log(req.query.id);
    const purchaseId = req.query.id;
    if (!purchaseId) {
      return res.status(400).json({ success: false, message: "Purchase ID is required" });
    }
    const deletedPurchase = await Purchase.findByIdAndDelete(purchaseId);
    if (!deletedPurchase) {
      return res.status(404).json({ success: false, message: "Purchase bill not found" });
    }
    res.json({ success: true, message: "Purchase bill deleted successfully" });
  } catch (error) {
    console.error("Error deleting purchase bill:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  handleMaterialAdding,
  handleMaterialList,
  handleMaterialPurchase,
  handleMaterialTotal,
  handlePurchaseById,
  handlePurchaseByDate,
  handlePurchaseByCareOf,
  handleCareOfAdding,
  handleCareOfList,
  handleDeletePurchaseBill,
  handleDeleteCareOf
};
