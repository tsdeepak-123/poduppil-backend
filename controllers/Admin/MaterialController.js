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


    // Find the project
    const findProject = await Project.findOne({ name: projectname });
    if (!findProject) {
      return res.json({
        success: false,
        message: "Failed find project",
      });
    }

    // Calculate total amount
    const totalAmount = materials.reduce((acc, cur) => {
      return (acc += cur.total);
    }, 0);
    // Create a new Purchase with the reference to the Careof
    const newMaterial = new Purchase({
      project: findProject._id,
      projectname: findProject.name,
      TotalAmount: totalAmount,
      Material: materials,
      date: date,
      // careof: findCareof._id, 
      careof:careof
    });

    await newMaterial.save();

    res.status(200).json({ success: true, message: "Purchase bill added" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};


//.......................PurchaseData   by id ...........................

const handlePurchaseById = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query; // Set default values for page and limit
    const projectid = req.query.projectid;
    const skip = (page - 1) * limit; // Calculate the number of documents to skip

    const [PurchaseData, totalCount] = await Promise.all([
      Purchase.find({ project: projectid })
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit),
      Purchase.countDocuments({ project: projectid }) // Get total count of documents
    ]);

    if (!PurchaseData || PurchaseData.length === 0) {
      return res.json({ success: false, message: "No data found" });
    }

    res.json({
      success: true,
      message: "PurchaseData found successfully",
      PurchaseData,
      totalCount
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
    // Fetch all PurchaseList with TotalAmount
    const PurchaseList = await Purchase.aggregate([
      {
        $unwind: "$Material",
      },
      {
        $match: { "Material._id": { $exists: true, $ne: null } } // Filter out null or undefined _id values
      },
      {
        $group: {
          _id: "$Material.careof",
          TotalAmount: { $sum: "$Material.total" },
        },
      }
    ]);

    return res.status(200).json({ PurchaseList });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};





const handleMaterialListByCareOf = async (req, res) => {
  try {
    const { careOf, page, search } = req.query; 
    const limit = 10;
    const match = search ? { 
      $or: [ 
        { "Material.name": { $regex: new RegExp(search, "i") } }, 
        { projectname: { $regex: new RegExp(search, "i") } }
      ] 
    } : {};

    const totalCount = await Purchase.countDocuments({ "Material.careof": careOf, ...match }); 
    const totalPages = Math.ceil(totalCount / limit);

    const materialList = await Purchase.find({ "Material.careof": careOf, ...match }) 
      .select("projectname date Material")
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ date: -1 });

    console.log(materialList);

    return res.status(200).json({ materialList, totalPages });
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
    const purchaseId = req.query.id;
    if (!purchaseId) {
      return res
        .status(400)
        .json({ success: false, message: "Purchase ID is required" });
    }
    const deletedPurchase = await Purchase.findByIdAndDelete(purchaseId);
    if (!deletedPurchase) {
      return res
        .status(404)
        .json({ success: false, message: "Purchase bill not found" });
    }
    res.json({ success: true, message: "Purchase bill deleted successfully" });
  } catch (error) {
    console.error("Error deleting purchase bill:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//payment to supplier

const handleCareOfPayment = async (req, res) => {
  try {
    const { date, Paidby, Payment, Amount } = req.body;
    const careofId = req.query.careofId;
    console.log(careofId);
    if (!careofId) {
      return res.status(400).json({ message: "Care of name is required" });
    }
    const careOf = await Careof.findById({ _id: careofId });
    if (!careOf) {
      return res.status(404).json({ message: "Care of not found" });
    }
    const payment = {
      date,
      amount: Amount,
      paymentType: Payment,
      paidBy: Paidby,
    };
    careOf.payments.push(payment);
    await careOf.save();
    res
      .status(200)
      .json({
        success: true,
        message: "Payment added to care of successfully",
        careOf,
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};


//get careof payments

const handleGetPayments=async(req,res)=>{
  try {
 
    const careOfId = req.query.id;
    if (!careOfId) {
      return res.status(400).json({ message: "Care of ID is required" });
    }
    const careOf = await Careof.findById(careOfId);
    if (!careOf) {
      return res.status(404).json({ message: "Care of not found" });
    }
    res.status(200).json({ success: true, payments: careOf.payments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}



//handle careof payment deatils total amount,paid pending

const handleCareOfBalance = async (req, res) => {
  try {
    const allCareOfs = await Careof.find();
    
    const careOfsWithBalance = await Promise.all(allCareOfs.map(async (careOf) => {
      const totalPayments = careOf.payments.reduce((acc, payment) => {
        return acc + payment.amount;
      }, 0);
    
      const totalAmountPurchased = await Purchase.aggregate([
        {
          $unwind: "$Material",
        },
        {
          $group: {
            _id: "$Material.careof",
            TotalAmount: { $sum: "$Material.total" },
          }
        }
      ]);
      const paid = totalPayments;
      let totalAmountForCareOf = 0;

for (const amount of totalAmountPurchased) {
    if (amount._id === careOf.name) {
        totalAmountForCareOf = amount.TotalAmount;
        break;
    }
}
      return {
        _id: careOf._id,
        name: careOf.name,
        totalAmountPurchased: totalAmountForCareOf,
        paid
      };
    }));
    
    

    res.status(200).json({ success: true, message: "Careofs found", allCareOfs: careOfsWithBalance });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}



const handleDeleteCareOfPayment=async(req,res)=>{
  try {
    const paymentId=req.query.id
    const careofId=req.query.careofId
    if (!careofId || !paymentId) {
      return res.status(400).json({ success: false, error: 'Project ID and received cash ID are required.' });
    }
    const careof = await Careof.findById(careofId);
    if (!careof) {
      return res.status(404).json({ success: false, error: 'careof not found.' });
    }
    const receivedCashIndex = careof.payments.findIndex(cash => cash._id.toString() === paymentId);
    if (receivedCashIndex === -1) {
      return res.status(404).json({ success: false, error: 'Received cash not found within the careof.' });
    }
    careof.payments.splice(receivedCashIndex, 1);
    await careof.save();
    return res.status(200).json({ success: true, message: 'Received cash deleted successfully.' });
   
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
}


const handleRecentPurchase = async (req, res) => {
  try {
    const recentPurchases = await Purchase.find().sort({ date: -1 }).limit(20);
    res.status(200).json(recentPurchases);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
}


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
  handleDeleteCareOf,
  handleCareOfPayment,
  handleGetPayments,
  handleCareOfBalance,
  handleDeleteCareOfPayment,
  handleMaterialListByCareOf,
  handleRecentPurchase
};
