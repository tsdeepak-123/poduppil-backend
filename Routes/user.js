const express = require("express");
const userRoute = express();
const upload = require("../Middleware/Multer");
const { AdminAuth } = require("../Middleware/Auth");
const { handleBannerAdding, handleFindBanner, handleUnblockBanner, handleBlockBanner, handleDeleteBanner } = require("../controllers/User/Banner");
const { handleProjectAdding, handleFindProject, handleBlockProject, handleUnblockProject, handleDeleteProject } = require("../controllers/User/Project");
const { handleInteriorAdding, handleFindInterior, handleBlockInterior, handleUnblockInterior, handleDeleteInterior } = require("../controllers/User/Interior");
const { handleFindService, handleBlockService, handleUnblockService, handleDeleteService, handleServiceAdding } = require("../controllers/User/Service");
const { handleFindOwner, handleBlockOwner, handleUnblockOwner, handleDeleteOwner, handleOwnerAdding } = require("../controllers/User/Owner");
const { handleSentMessage, handleFindMessage, handleDeleteMessage } = require("../controllers/User/Contact");

userRoute.post("/addbanner", AdminAuth ,upload.fields([{ name: "photo", maxCount: 1 }]),handleBannerAdding)
userRoute.get("/findbanner", handleFindBanner);
userRoute.patch("/blockbanner",AdminAuth , handleBlockBanner);
userRoute.patch("/unblockbanner",AdminAuth , handleUnblockBanner);
userRoute.patch("/deletebanner",AdminAuth , handleDeleteBanner);

userRoute.post("/addproject",AdminAuth ,upload.fields([{ name: "photo", maxCount: 1 }]),handleProjectAdding)
userRoute.get("/findproject",handleFindProject);
userRoute.patch("/blockproject",AdminAuth , handleBlockProject);
userRoute.patch("/unblockproject",AdminAuth , handleUnblockProject);
userRoute.patch("/deleteproject",AdminAuth , handleDeleteProject);

userRoute.post("/addinterior",AdminAuth ,upload.fields([{ name: "photo", maxCount: 1 }]),handleInteriorAdding)
userRoute.get("/findinterior",handleFindInterior);
userRoute.patch("/blockinterior",AdminAuth , handleBlockInterior);
userRoute.patch("/unblockinterior",AdminAuth , handleUnblockInterior);
userRoute.patch("/deleteinterior",AdminAuth , handleDeleteInterior);


userRoute.post("/addservice",AdminAuth ,upload.fields([{ name: "photo", maxCount: 1 }]),handleServiceAdding)
userRoute.get("/findservice",handleFindService);
userRoute.patch("/blockservice",AdminAuth , handleBlockService);
userRoute.patch("/unblockservice",AdminAuth , handleUnblockService);
userRoute.patch("/deleteservice",AdminAuth , handleDeleteService);

userRoute.post("/addowner",AdminAuth ,upload.fields([{ name: "photo", maxCount: 1 }]),handleOwnerAdding)
userRoute.get("/findowner",handleFindOwner);
userRoute.patch("/blockowner",AdminAuth ,handleBlockOwner );
userRoute.patch("/unblockowner",AdminAuth ,handleUnblockOwner);
userRoute.patch("/deleteowner",AdminAuth ,handleDeleteOwner );


userRoute.post("/sentmessage",handleSentMessage)
userRoute.get("/getmessage",AdminAuth,handleFindMessage)
userRoute.patch("/deletemessage",AdminAuth,handleDeleteMessage)



module.exports = userRoute;
