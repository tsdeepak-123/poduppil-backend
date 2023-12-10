const admin = require("../../models/Admin/AdminModel");
const jwt = require("jsonwebtoken");
const bcrypt=require("bcrypt")


//password bcrypting

const securepassword = async (password) => {
  try {
    const hashpassword = await bcrypt.hash(password, 10);
    return hashpassword;
  } catch (error) {
    console.log(error);
  }
};



const handleSignUp = async (req, res) => {
  try {
    const { email, password } = req.body;
   const hashPassword=await securepassword(password)
   console.log(hashPassword);
    const adminData = new admin({
      email,
      password:hashPassword
    });
    await adminData.save();

    if (!adminData) {
      return res.status(500).json({ message: "unable to add admin" });
    }
    return res.status(201).json({ adminData });
  } catch (error) {
    res.status(500).json({ error: error.messege });
  }
};
//........................get admin data.........................
const adminData = async (req, res) => {
  try {
    const adminData = await admin.findOne();
    if (!adminData) {
      return res.status(404).json({ message: "Admin not found" });
    }
    return res.status(200).json({ adminData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//.........................update admin id and password..............................

const updateAdminData = async (req, res) => {
  try {
    const adminId = req.query.id;
    const { email, newPassword, currentPassword } = req.body;
    if(adminId &&email ,newPassword, currentPassword){
      const adminData = await admin.findById(adminId);
      if (!adminData) {
        return res.json({success:false, message: "Admin not found" });
      }
      const status = await bcrypt.compare(currentPassword, adminData.password);
    
      if (status) {
        const hashPassword=await securepassword(newPassword)
        adminData.email = email;
        adminData.password = hashPassword;

        await adminData.save();
        return res.json({success:true, message: "Admin data updated successfully" })
      } else {
        return res.json({success:false, message: "Please provide a correct password" });
      }
    }else{
      res.json({success:false,message:"All fields required"})
    }
   
  } catch (error) {
    res.json({ error: error.message });
  }
};

// This function handles admin sign-in, taking in a request (req) and a response (res) as parameters.

const handleSignIn = async (req, res) => {
  try {
    let adminSignin = {
      Status: false,
      message: null,
      token: null,
    };
    const { email, password } = req.body;
    if (email && password) {
      const AdminData = await admin.findOne({ email: email });
      if (!AdminData) {
        res.status(404).json({ success: false, messege: "Invalid email" });
      } else {
        const status = await bcrypt.compare(password, AdminData.password);
        if (status) {
          const payload = { id: AdminData._id };
          const expiresIn = "24h";
          let AdminToken = jwt.sign(payload, "AdminsecretKey", { expiresIn });
  

          adminSignin.token = AdminToken;
          adminSignin.Status = true;
          adminSignin.message = "Authenticated";

          res
            .status(200)
            .json({ adminSignin, success: true, messege: "Authenticated" });
        } else {
          res
            .status(401)
            .json({ success: false, messege: "Incorrect Password" });
        }
      }
    } else {
      res.status(400).json({ success: false, messege: "Invalid Credentials" });
    }
  } catch (error) {
    res.status(500).json({ error: error.messege });
  }
};

module.exports = { handleSignIn, handleSignUp, adminData, updateAdminData };
