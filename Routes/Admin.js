const express = require("express");
const adminRoute = express();
const {
  handleSignIn,
  handleSignUp,
  adminData,
  updateAdminData
} = require("../controllers/Admin/AdminController");
const {
  handleLabourAdding,
  handleLabourDetails,
  handleAttendance,
  salarycalculationoflabour,
  handleLabourById,
  labourAttendanceById,
  salarycalculation,
  handleAttendanceList,
  handleLabourAdvance,
  handleLabourHIstory,
  labourAttendanceEdit,
  handleAllLabourHIstory,
  handleSalaryControll,
  handleLabourSalaryById,
  handleLabourEditing
} = require("../controllers/Admin/LabourController");
const {
  handleStaffAdding,
  handleStaffDetails,
  handleAttendanceofStaff,
  salarycalculationofStaff,
  handleStaffById,
  handleAttendanceListofStaff,
  handleStaffAdvance,
  salarycalculationforStaff,
  stafffAttendanceEdit,
  handleAllStaffHIstory,
  StaffAttendanceById,
  handleStaffSalaryControll,
  handleStaffSalaryById,
  handleStaffEditing
} = require("../controllers/Admin/StaffController");
const {
  handleProjectAdding,
  handleProjectEditing,
  ProjectList,
  ProjectListById,
  handlePhotoAdding,
  handleCompletedProjects,
  handlepayment,
  handleRecievedCash,
  handleRecievedCashByProject
} = require("../controllers/Admin/ProjectController");
const {
  handleAddContract,
  ContractList,
  ContractListById,
  handleEditContract,
  handleCompletedContracts,
  handleWorkerCount,
  handleFindLabourCount,
  handleLabourCountById,
  handleContractByProjectId
} = require("../controllers/Admin/ContractController");

const {
  handleBillAdding,
  handleBillDetails,
  handleBillSingleView,
  handleCompletedBills,
} = require("../controllers/Admin/BillController");
const upload = require("../Middleware/Multer");
const { AdminAuth } = require("../Middleware/Auth");
const {
  handleMaterialAdding,
  handleMaterialList,
  handleMaterialPurchase,
  handleMaterialTotal,
  handlePurchaseById,
  handlePurchaseByDate,
  handlePurchaseByCareOf,
} = require("../controllers/Admin/MaterialController");

//The routes for admin authentication

adminRoute.post("/login", handleSignIn);
adminRoute.post("/signup", handleSignUp);
adminRoute.post(  "/addlabour",AdminAuth,upload.fields([{ name: "proof", maxCount: 2 },{ name: "photo", maxCount: 1 },]),handleLabourAdding);
adminRoute.patch("/editlabour/:id",AdminAuth,handleLabourEditing)
adminRoute.get("/labourslist", AdminAuth, handleLabourDetails);
adminRoute.get("/labourbyid", AdminAuth, handleLabourById);
adminRoute.post(
  "/addstaff",
  AdminAuth,
  upload.fields([
    { name: "proof", maxCount: 2 },
    { name: "photo", maxCount: 1 },
  ]),
  handleStaffAdding
);
adminRoute.patch("/editstaff/:id",AdminAuth,handleStaffEditing)
adminRoute.get("/staffslist", AdminAuth, handleStaffDetails);
adminRoute.get("/staffByid", AdminAuth, handleStaffById);
adminRoute.post("/labourattendance", AdminAuth, handleAttendance);
adminRoute.get("/labourattendancelist", AdminAuth, handleAttendanceList);
adminRoute.post("/staffattendance", AdminAuth, handleAttendanceofStaff);
//.......attendancelist
adminRoute.get("/staffattendanceList", AdminAuth, handleAttendanceListofStaff);
adminRoute.get("/salarycalculation", AdminAuth, salarycalculationoflabour);
adminRoute.post("/salaryoflabour", AdminAuth, salarycalculation);
adminRoute.post("/salaryofStaff", AdminAuth, salarycalculationforStaff);
adminRoute.get("/staffsalary", AdminAuth, salarycalculationofStaff);
adminRoute.post("/addproject", AdminAuth, handleProjectAdding);
adminRoute.patch("/editproject/:id", AdminAuth, handleProjectEditing);
adminRoute.post("/AddContract", AdminAuth, handleAddContract);
adminRoute.get("/ContractList", AdminAuth, ContractList);
adminRoute.get("/ContractById", AdminAuth, ContractListById);
adminRoute.get("/projectList", AdminAuth, ProjectList);
adminRoute.get("/projectById", AdminAuth, ProjectListById);
adminRoute.get("/labourattendanceById", AdminAuth, labourAttendanceById);
adminRoute.get("/staffattendanceById", AdminAuth, StaffAttendanceById);
adminRoute.post("/labouradvance", AdminAuth, handleLabourAdvance);
adminRoute.post("/staffadvance", AdminAuth, handleStaffAdvance);
adminRoute.post("/addbills",AdminAuth,upload.fields([{ name: "photo", maxCount: 1 }]),handleBillAdding);
adminRoute.get("/billslist", AdminAuth, handleBillDetails);
adminRoute.get("/laboursalaryhistory", AdminAuth, handleLabourHIstory);
adminRoute.get("/alllaboursalaryhistory", AdminAuth, handleAllLabourHIstory);
adminRoute.post("/labourAttendanceEdit", AdminAuth, labourAttendanceEdit);
adminRoute.post("/EditContract", AdminAuth, handleEditContract);
adminRoute.post("/staffAttendanceEdit", AdminAuth, stafffAttendanceEdit);
adminRoute.get("/allStaffsalaryhistory", AdminAuth, handleAllStaffHIstory);
adminRoute.post("/addprojectphotos",AdminAuth,upload.fields([{ name: "photos", maxCount: 2 }]),handlePhotoAdding);
adminRoute.post("/addmaterial", AdminAuth, handleMaterialAdding);
adminRoute.get("/allmateriallist", AdminAuth, handleMaterialList);
adminRoute.post("/purchasematerial", AdminAuth, handleMaterialPurchase);
adminRoute.post("/completedprojects", AdminAuth, handleCompletedProjects);
adminRoute.get("/materialtotal", AdminAuth, handleMaterialTotal);
adminRoute.get("/billsingle", AdminAuth, handleBillSingleView);
adminRoute.post("/paidbills", AdminAuth, handleCompletedBills);
adminRoute.get("/PurchaseBillById", AdminAuth, handlePurchaseById);
adminRoute.get("/PurchaseBillByDate", AdminAuth, handlePurchaseByDate);
adminRoute.post("/laboursalarystatus", AdminAuth, handleSalaryControll);
adminRoute.post("/completedcontracts", AdminAuth, handleCompletedContracts);
adminRoute.patch("/handleWorkerCount",AdminAuth, handleWorkerCount);
adminRoute.patch("/handlepayment",AdminAuth, handlepayment);
adminRoute.post("/staffsalarystatus", AdminAuth, handleStaffSalaryControll);

//  salary by id
adminRoute.get("/handleLabourSalaryById",AdminAuth,handleLabourSalaryById);
adminRoute.get("/handleStaffSalaryById",AdminAuth,handleStaffSalaryById);
// admin data for editing  
adminRoute.get("/admindata",AdminAuth,adminData);
adminRoute.patch("/updateAdminData",AdminAuth,updateAdminData);
// adminRoute.get("/getlabourcount",AdminAuth,handleFindLabourCount);
adminRoute.get("/recievedcash",AdminAuth,handleRecievedCash);
adminRoute.get("/recievedcashbyproject",AdminAuth,handleRecievedCashByProject);
adminRoute.get("/getlabourcountbyid",AdminAuth,handleLabourCountById);
adminRoute.get("/getcontractsbyid",AdminAuth,handleContractByProjectId);
adminRoute.get("/purchasebycareof",AdminAuth,handlePurchaseByCareOf);

module.exports = adminRoute;
