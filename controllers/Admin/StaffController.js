const Staff = require("../../models/Admin/StaffModel");
const Staffattendance = require("../../models/Admin/StaffAttendance");

const StaffSalary = require("../../models/Admin/StaffSalaryModel");
const cloudinary = require("../../Middleware/Cloudinary");
const moment = require("moment");

// This function handles Staff Adding to database, taking in a request (req) and a response (res) as parameters.

const handleStaffAdding = async (req, res) => {
  try {
    const {
      name,
      age,
      phone,
      street,
      post,
      town,
      district,
      state,
      pincode,
      salary,
      adhar,
      date,
    } = req.body;

    if (
      name &&
      phone &&
      street &&
      post &&
      town &&
      district &&
      state &&
      pincode &&
      salary &&
      date
    ) {
      const StaffExist = await Staff.findOne({ adhar });

      if (StaffExist) {
        return res.json({
          success: false,
          message: "Staff already exists. Please check the staff List.",
        });
      }

      if (!req.files || !req.files.proof || !req.files.photo) {
        return res.json({
          success: false,
          message: "Both proof and photo must be uploaded.",
        });
      }

      const proofUrls = [];
      for (const proof of req.files.proof) {
        const proofUpload = await cloudinary.uploader.upload(proof.path);
        if (!proofUpload.secure_url) {
          return res.json({
            success: false,
            message: "Failed to upload proof or photo",
          });
        }
        proofUrls.push(proofUpload.secure_url);
      }
      const photoUpload = await cloudinary.uploader.upload(
        req.files.photo[0].path
      );

      if (!photoUpload.secure_url) {
        return res.json({
          success: false,
          message: "Failed to upload proof or photo",
        });
      }

      const newStaff = new Staff({
        name,
        age,
        phone,
        IdProof: proofUrls,
        photo: photoUpload.secure_url,
        address: {
          street,
          post,
          town,
          district,
          state,
          pincode,
        },
        salary,
        adhar,
        date,
      });

      await newStaff.save();

      return res
        .status(200)
        .json({ success: true, message: "staff added successfully." });
    } else {
      return res.json({
        success: false,
        message: "All fields must be filled.",
      });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};



//-----------------------------------edit staff-----------------------------

const handleStaffEditing = async (req, res) => {
  try {
    console.log("hiiiiiiiiiiiiiii");
    const id = req.params.id;

    if (
      !req.body.name ||
      !req.body.age ||
      !req.body.phone ||
      !req.body.street ||
      !req.body.post ||
      !req.body.town ||
      !req.body.district ||
      !req.body.state ||
      !req.body.pincode ||
      !req.body.salary ||
      !req.body.adhar ||
      !req.body.date
    ) {
      return res
        .status(400)
        .json({ success: false, messege: "All fields must be field " });
    }
   
    const updatedStaff = await Staff.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true }
    );

    if (!updatedStaff) {
      return res.status(404).json({ error: "Staff not found" });
    }

    res
      .status(200)
      .json({ success: true, messege: "Staff Updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};


// This function handles Staff Details pic from data base, taking in a request (req) and a response (res) as parameters.

const handleStaffDetails = async (req, res) => {
  try {
    const allStaffData = await Staff.find();

    res.json({ allStaffData });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// ......................staff data using id .........................

const handleStaffById = async (req, res) => {
  try {
    const id = req.query.id;
    const StaffData = await Staff.findById({ _id: id });
    if (!StaffData) {
      res.json({ success: false, message: "cant find Staff details " });
    }
    res.json({ StaffData });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

//  ...............................................staff attendance..............................................

const handleAttendanceofStaff = async (req, res) => {
  try {
    const { selectedValues } = req.body;

    const currentDate = moment();
    const formattedDate = currentDate.format("YYYY-MM-DD");

    let attendanceDocument = await Staffattendance.findOne({
      date: formattedDate,
    });

    if (!attendanceDocument) {
      attendanceDocument = new Staffattendance({
        date: formattedDate,
        records: [],
      });
    }

    for (const StaffId in selectedValues) {
      const status = selectedValues[StaffId];

      const recordIndex = attendanceDocument.records.findIndex(
        (record) => record.StaffId && record.StaffId.equals(StaffId)
      );

      if (recordIndex !== -1) {
        attendanceDocument.records[recordIndex].status = status;
      } else {
        attendanceDocument.records.push({ StaffId, status });
      }
    }

    await attendanceDocument.save();

    res.status(200).json({ message: "Attendance updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

//..........................attendance list ............................................................

const handleAttendanceListofStaff = async (req, res) => {
  try {
    const currentDate = moment();
    const formattedDate = currentDate.format("YYYY-MM-DD");

    const StaffAttendance = await Staffattendance.find({ date: formattedDate });

    if (StaffAttendance.length === 0) {
      res.json({ message: "Attendance not found" });
    } else {
      const promises = StaffAttendance.map((attendanceDocument) =>
        Promise.all(
          attendanceDocument.records.map(async (record) => {
            const staffData = await Staff.findById({ _id: record.StaffId });
            record.StaffId = staffData;
          })
        )
      );
      await Promise.all(promises);
      res.status(200).json({
        message: "Attendance retrieved successfully",
        StaffAttendance,
      });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

//  .........................................staff salary calculation .................................................

const salarycalculationofStaff = async (req, res) => {
  try {
    const { staffId } = req.query;

    const StaffData = await Staff.findById({ _id: staffId });

    if (!StaffData) {
      return res.status(404).json({
        message: "StaffData not found.",
      });
    }
    if (StaffData.lastsalaryDate) {
      StaffData.lastsalaryDate.setDate(StaffData.lastsalaryDate.getDate() + 1);
    }

    const endDate = new Date();
    const startDate = new Date(StaffData.lastsalaryDate || StaffData.date);

    const attendanceRecords = await Staffattendance.find({
      "records.StaffId": staffId,
      date: { $gte: startDate, $lte: endDate },
    });

    if (!attendanceRecords) {
      return res.status(404).json({
        message: "staff attendance records not found for the specified period.",
      });
    }

    const attendanceStatus = {
      absent: 0,
      halfday: 0,
      present: 0,
    };

    attendanceRecords.forEach((record) => {
      record.records.forEach((attendanceRecord) => {
        if (attendanceRecord.StaffId.equals(staffId)) {
          attendanceStatus[attendanceRecord.status]++;
        }
      });
    });

    const salary =
      StaffData?.salary * attendanceStatus?.present +
      (StaffData?.salary * attendanceStatus?.halfday) / 2;

    const salaryData = {
      StaffData: StaffData,
      present: attendanceStatus?.present ?? 0,
      halfday: attendanceStatus?.halfday ?? 0,
      absent: attendanceStatus?.absent ?? 0,
      advance: StaffData.advance,
      lastweek: salary,
      balance: salary - StaffData.advance,
    };
    return res.json({ salaryData, message: "salarydata not found." });
  } catch (error) {
    res
      .status(500)
      .json({ message: "An error occurred during salary calculation." });
  }
};

//............................ salary calculation ..........................................

const salarycalculationforStaff = async (req, res) => {
  try {
    const { staffId } = req.query;
    const { staffSalarydate } = req.query;

    const StaffData = await Staff.findById({ _id: staffId });

    if (!StaffData) {
      return res.status(404).json({
        message: "staff not found.",
      });
    }

    const endDate = new Date(staffSalarydate);
    let startDate;
    if (StaffData.lastsalaryDate) {
      startDate = new Date(StaffData.lastsalaryDate);
      startDate.setDate(startDate.getDate() + 1);
    } else {
      startDate = new Date(StaffData.date);
    }
    const today = new Date();

    const startdatePart = startDate.toISOString().slice(0, 10);
    const enddatePart = endDate.toISOString().slice(0, 10);
    const todayPart = today.toISOString().slice(0, 10);

    if (todayPart == enddatePart) {
      endDate.setDate(endDate.getDate() + 1);
    }

    const attendanceRecords = await Staffattendance.find({
      "records.StaffId": staffId,
      date: { $gte: startDate, $lte: endDate },
    });

    if (!attendanceRecords) {
      return res.status(404).json({
        message: "staff attendance records not found for the specified period.",
      });
    }

    const attendanceStatus = {
      absent: 0,
      halfday: 0,
      present: 0,
    };

    attendanceRecords.forEach((record) => {
      record.records.forEach((attendanceRecord) => {
        if (attendanceRecord.StaffId.equals(staffId)) {
          attendanceStatus[attendanceRecord.status]++;
        }
      });
    });

    if (todayPart == enddatePart) {
      endDate.setDate(endDate.getDate() - 1);
    }
    const salary =
      StaffData?.salary * attendanceStatus?.present +
      (StaffData?.salary * attendanceStatus?.halfday) / 2;

    const SalaryData = await StaffSalary.findOne({ StaffId: staffId });

    if (SalaryData) {
      const newRecord = {
        calculateFrom: startDate,
        calculateTo: endDate,
        present: attendanceStatus.present,
        halfday: attendanceStatus.halfday,
        absent: attendanceStatus.absent,
        date: new Date(),
        totalSalary: salary,
        advance: StaffData.advance,
        updatedSalary: salary - StaffData.advance,
      };

      SalaryData.records.addToSet(newRecord);
      await SalaryData.save();
    } else {
      const salaryofStaff = new StaffSalary({
        StaffId: staffId,
        records: [
          {
            calculateFrom: startDate,
            calculateTo: endDate,
            present: attendanceStatus.present ?? 0,
            halfday: attendanceStatus.halfday ?? 0,
            absent: attendanceStatus.absent ?? 0,
            date: new Date(),
            totalSalary: salary,
            advance: StaffData.advance,
            updatedSalary: salary - StaffData.advance,
          },
        ],
      });

      await salaryofStaff.save();

      if (salary > StaffData.advance) {
        await Staff.findByIdAndUpdate({ _id: StaffData._id }, { advance: 0 });
      } else {
        await Staff.findByIdAndUpdate(
          { _id: StaffData._id },
          { advance: StaffData.advance - salary }
        );
      }
    }

    const salaryDatas = await StaffSalary.findOne({
      StaffId: staffId,
    }).populate("StaffId");

    salaryDatas.records.sort((a, b) => b.calculateTo - a.calculateTo);
    const latestRecord = salaryDatas.records[0];

    await Staff.findByIdAndUpdate(
      { _id: StaffData._id },
      { lastsalaryDate: latestRecord.calculateTo }
    );

    res.status(200).json({ message: "Salary calculated successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "An error occurred during salary calculation." });
  }
};

// giving advance to staff----------------------------------------------------------------------------

const handleStaffAdvance = async (req, res) => {
  try {
    const id = req.query.id;
    const { advance } = req.body;
    const staffData = await Staff.findById({ _id: id });
    if (!staffData) {
      res.json({ message: "No staff found" });
    }
    const updatedAdvance = staffData.advance + parseFloat(advance);
    await Staff.updateOne({ _id: id }, { $set: { advance: updatedAdvance } });
    res.json({ message: "Advance updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

//..................... staff attendance edit ......................................................

const stafffAttendanceEdit = async (req, res) => {
  try {
    const { staffId, status } = req.body;

    const currentDate = new Date();
    const startOfDay = new Date(currentDate);

    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(currentDate);

    endOfDay.setHours(23, 59, 59, 999);

    const attendanceRecords = await Staffattendance.find({
      date: { $gte: startOfDay, $lt: endOfDay },
    });

    attendanceRecords.forEach(async (record) => {
      const matchingRecord = record.records.find((r) => r.StaffId == staffId);

      if (matchingRecord) {
        matchingRecord.status = status;
      } else {
        record.records.push({ StaffId: staffId, status });
      }
    });

    const updatedRecords = await Promise.all(
      attendanceRecords.map((record) => record.save())
    );

    res.status(200).json({ message: "successfull", updatedRecords });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

//...........................  salary history of all Staff ...............................

const handleAllStaffHIstory = async (req, res) => {
  try {
    const StaffSalaryData = await StaffSalary.find().populate("StaffId");

    if (!StaffSalaryData) {
      res.json({ message: "No staff found" });
    }

    const updatedStaffSalaryData = StaffSalaryData.map((staff) => {
      if (staff.records.length > 0) {
        const sortedRecords = staff.records.sort(
          (a, b) => new Date(b.date) - new Date(a.date)
        );
        const latestRecord = sortedRecords[0];
        staff.records = [latestRecord];
      }
      return staff;
    });

    res.status(200).json({ message: "successfull", updatedStaffSalaryData });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

//........................  saff salary by id .....................................................

const handleStaffSalaryById = async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) {
      return res
        .status(400)
        .json({ message: "Missing StaffId in query parameters" });
    }

    const StaffSalaryData = await StaffSalary.find({ StaffId: id }).populate(
      "StaffId"
    );

    if (!StaffSalaryData || StaffSalaryData.length === 0) {
      return res
        .status(404)
        .json({ message: "No staff found with the given StaffId" });
    }

    res
      .status(200)
      .json({
        message: "Successfully found staff's salary data",
        StaffSalaryData,
      });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

//-----------------------------------------------

const StaffAttendanceById = async (req, res) => {
  try {
    const staffId = req.query.staffId;
    const attendanceRecords = await Staffattendance.find({
      "records.StaffId": staffId,
    });
    const staffData = {};
    attendanceRecords.forEach((record) => {
      record.records.forEach((attendanceRecord) => {
        if (attendanceRecord.StaffId.equals(staffId)) {
          const date = moment(record.date).format("YYYY-MM-DD");
          const status = attendanceRecord.status;
          staffData[date] = status;
        }
      });
    });
    res.status(200).json({ staffData });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

//--------------------here is the changing status of staff

const handleStaffSalaryControll = async (req, res) => {
  try {
    const id = req.query.id;
    const status = req.body.status;

    await StaffSalary.findOneAndUpdate(
      { "records._id": id },
      { $set: { "records.$[elem].Is_status": status } },
      { arrayFilters: [{ "elem._id": id }] }
    );

    res.json({ success: true, message: "salary status updated successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error updating salary status" });
  }
};

module.exports = {
  handleStaffAdding,
  handleStaffDetails,
  handleStaffById,
  handleAttendanceofStaff,
  salarycalculationofStaff,
  salarycalculationforStaff,
  handleAttendanceListofStaff,
  handleStaffAdvance,
  stafffAttendanceEdit,
  handleAllStaffHIstory,
  StaffAttendanceById,
  handleStaffSalaryControll,
  handleStaffSalaryById,
  handleStaffEditing
};
