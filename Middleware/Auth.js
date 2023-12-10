const Admin = require('../models/Admin/AdminModel');
const jwt = require("jsonwebtoken");

const AdminAuth = async (req, res, next) => {
    try {
        const header = req.headers.authorization;
        if (!header) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const token = header.replace('Bearer ', ''); 

        const secretKey = 'AdminsecretKey'; 

        const decodedToken = jwt.verify(token, secretKey);
        const userId = decodedToken.id;

        const adminData = await Admin.findById({ _id: userId });

        if (adminData) {
            req.id = adminData._id;
            next();
        } else {
            return res.status(401).json({ error: "Unauthorized" })
        }
    } catch (error) {
        return res.status(401).json({ error: "Invalid token" })
    }
}

module.exports = { AdminAuth };
