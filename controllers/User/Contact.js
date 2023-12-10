const Contact = require("../../models/User/Contact");

const handleSentMessage = async (req, res) => {
  try {
    const { email, name, subject, message } = req.body;
    if (email && name && subject && message) {
      const newContact = new Contact({
        email: email,
        message: message,
        name: name,
        subject: subject,
      });

      await newContact.save();
      res.json({ success: true, message: "Message sent" });
    } else {
      res.json({ success: false, message: "All fields required" });
    }
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
};

const handleFindMessage = async (req, res) => {
  try {
    const messageData = await Contact.find();
    res.json({ success: true, message: "Data finded", messageData });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
};



const handleDeleteMessage = async (req, res) => {
  try {
    const id = req.query.id;
    const deletedMessege = await Contact.findByIdAndDelete(id);

    if (!deletedMessege) {
      return res
        .status(404)
        .json({ success: false, message: "Messege not found" });
    }

    return res.json({
      success: true,
      message: "Messege deleted successfully",
    });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
};

module.exports = { handleSentMessage, handleFindMessage,handleDeleteMessage };
