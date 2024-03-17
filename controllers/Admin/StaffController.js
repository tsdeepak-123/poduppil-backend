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

      const proofUrls = [];
      if (req.files && req.files.proof) {
        for (const proof of req.files.proof) {
          const proofUpload = await cloudinary.uploader.upload(proof.path);
          if (!proofUpload.secure_url) {
            return res.json({
              success: false,
              message: "Failed to upload proof.",
            });
          }
          proofUrls.push(proofUpload.secure_url);
        }
      }

      let photoUrl;
      if (req.files && req.files.photo) {
        const photoUpload = await cloudinary.uploader.upload(
          req.files.photo[0].path
        );

        if (!photoUpload.secure_url) {
          return res.json({
            success: false,
            message: "Failed to upload photo.",
          });
        }

        photoUrl = photoUpload.secure_url;
      }

      const newStaff = new Staff({
        name,
        age,
        phone,
        IdProof: proofUrls,
        photo: photoUrl,
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
        .json({ success: true, message: "Staff added successfully." });
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
    
    const id = req.params.id;

      // Update photo if it exists in the request
      if (req.files.photo) {
        const photoUpload = await cloudinary.uploader.upload(req.files.photo[0].path);
        
        if (!photoUpload.secure_url) {
          return res.json({
            success: false, 
            message: "Failed to upload photo",
          });
        }
  
        // Add the updated photo URL to req.body
        req.body.photo = photoUpload.secure_url;
      }else{
            const existingStaff = await Staff.findById(id);
      if (existingStaff) {
        req.body.photo = existingStaff.photo;
      }
      }
  
      // Update proof if it exists in the request
      if (req.files && req.files.proof) {
        const proofUrls = [];
  
        for (const proof of req.files.proof) {
          const proofUpload = await cloudinary.uploader.upload(proof.path);
  
          if (!proofUpload.secure_url) {
            return res.json({
              success: false,
              message: "Failed to upload proof",
            });
          }
  
          proofUrls.push(proofUpload.secure_url);
        }
  
        // Update the IdProof field in req.body with the new proof URLs
        req.body.IdProof = proofUrls;
      }

       
    req.body.address=JSON.parse(req.body.address)



    if (
      !req.body.name ||
      !req.body.age ||
      !req.body.phone ||
      !req.body.address||
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
      .json({ success: true, message: "Staff Updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};



// This function handles Staff Details pic from data base, taking in a request (req) and a response (res) as parameters.

const handleStaffDetails = async (req, res) => {
  try {
    const { page = 1, searchTerm = "" } = req.query;
    const limit = 10; // Number of items per page
    const skip = (page - 1) * limit;

    const query = {
      name: { $regex: searchTerm, $options: "i" } 
    };

    const allStaffData = await Staff.find(query)
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit)

    const totalCount = await Staff.countDocuments(query);
    console.log(allStaffData);

    res.json({ allStaffData, totalCount });
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

//handle staff attendance sheet

const handleStaffAttendanceSheet = async (req, res) => {
  try {
    const { date } = req.query;
    console.log("dateeeeeeeee", date);

    // Find attendance data for the selected date
    const attendanceData = await Staffattendance.findOne({ date: date });

    if (attendanceData) {
      // Extract staffIds from attendance data
      const staffIdsWithAttendance = attendanceData.records.map(record => record.StaffId);

      // Fetch staffs who do not have attendance records for the selected date
      const staffsWithoutAttendance = await Staff.find({
        _id: { $nin: staffIdsWithAttendance }
      });
      // Send the response with staff details
      return res.json({ attendanceData: staffsWithoutAttendance });
    } else {
      // If no attendance data found for the selected date, return all staffs
      const allstaffs = await Staff.find({});
      return res.json({ attendanceData: allstaffs });
    }
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ error: error.message });
  }
};



//  ...............................................staff attendance..............................................

const handleAttendanceofStaff = async (req, res) => {
  try {
    const { selectedValues, date } = req.body;
    let attendanceDocument = await Staffattendance.findOne({ date: date });

    if (!attendanceDocument) {
      attendanceDocument = new Staffattendance({ date: date, records: [] });
    }

    if (!attendanceDocument) {
      res.status(500).json({ success: false, message: "Server error" });
      return;
    }

    for (const StaffId in selectedValues) {
      const status = selectedValues[StaffId];
      const existingRecordIndex = attendanceDocument.records.findIndex(
        (record) => record.StaffId.toString() === StaffId
      );

      if (existingRecordIndex !== -1) {
        // Update existing record
        attendanceDocument.records[existingRecordIndex].status = status;
      } else {
        // Add new record
        attendanceDocument.records.push({ StaffId, status });
      }
    }

    await attendanceDocument.save();
    return res
      .status(200)
      .json({ success: true, message: "Attendance updated successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
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

        // Calculate total reduced amount of advance
    const totalAdvance = StaffData.advance.reduce((total, advance) => {
      return total + advance.amount;
    }, 0);
    console.log(totalAdvance);

    const salaryData = {
      StaffData: StaffData,
      present: attendanceStatus?.present ?? 0,
      halfday: attendanceStatus?.halfday ?? 0,
      absent: attendanceStatus?.absent ?? 0,
      totalAdvance: totalAdvance,
      lastweek: salary,
      balance: salary - totalAdvance,
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
    const { amount, date } = req.body;

    // Validate request data
    if (!id || !amount || !date) {
      return res.status(400).json({ message: "Invalid request data" });
    }

    // Find the Staff document by ID
    let staffData = await Staff.findById(id);

    // If no Staff document found with the provided ID, return a response
    if (!staffData) {
      return res.status(404).json({ message: "No Staff found" });
    }

    // If the advance field is not an array, initialize it as an empty array
    if (!Array.isArray(staffData.advance)) {
      staffData.advance = [];
    }

    // Create a new advance object with the provided amount and date
    const newAdvance = {
      amount: parseFloat(amount), // Assuming amount is a string representation of a number
      date: new Date(date) // Convert date string to a Date object
    };

    // Push the new advance object into the advance array of staffData
    staffData.advance.push(newAdvance);

    // Save the updated Staff document
    await staffData.save();

    // Respond with a success message
    res.json({ message: "Advance updated successfully" });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};


//..................... staff attendance edit ......................................................

const staffAttendanceEdit = async (req, res) => {
  try {
    const { staffId, status, date } = req.body;

    const attendanceRecord = await Staffattendance.findOne({
      date: date,
    });

    if (attendanceRecord) {
      const matchingRecord = attendanceRecord.records.find(
        (r) => r.StaffId == staffId
      );

      if (matchingRecord) {
        matchingRecord.status = status;
      } else {
        attendanceRecord.records.push({ staffId: staffId, status });
      }

      await attendanceRecord.save();
      res.status(200).json({ success: true, message: "Successful", updatedRecord: attendanceRecord });
    } else {
      res.status(404).json({ success: false, message: "Attendance record not found for the specified date" });
    }
  } catch (error) {
    console.error(error);
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
    console.log(req.query.year);
    const staffId = req.query.staffId;
    const month = req.query.month;
    const year = req.query.year; 
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, parseInt(month) + 1, 0);

    const attendanceRecords = await Staffattendance.find({
      "records.StaffId": staffId,
      date: {
        $gte: firstDayOfMonth,
        $lte: lastDayOfMonth
      }
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




const handleDeleteStaff = async (req, res) => {
  try { 
    const id = req.query.id;
    const deletedStaff = await Staff.findByIdAndDelete(id);

    if (!deletedStaff) {
      return res
        .status(404)
        .json({ success: false, message: "Staff not found" });
    }

    return res.json({
      success: true,
      message: "Staff deleted successfully",
    });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
};



//advance by staff


const handleAdvanceHistoryOfStaff = async (req, res) => {
  try {
    const staffId = req.query.id;
    const staff = await Staff.findById(staffId);
    if (!staff) {
      return res.status(404).json({ message: "staff not found" });
    }
    const sortedPaymentRecords = staff.advance.sort((a, b) => a.date - b.date);

     // Calculate total payment
     const totalPayment = sortedPaymentRecords.reduce((total, record) => {
      return total + record.amount;
    }, 0);


    return res.status(200).json({ paymentRecords: sortedPaymentRecords ,totalPayment});
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

//delete advance

const handleDeleteStaffAdvance = async (req, res) => {
  try {
    const staffId = req.query.staffId;
    const advanceCashId = req.query.id;
    if (!staffId || !advanceCashId) {
      return res.status(400).json({ success: false, error: 'staff ID and advance cash ID are required.' });
    }
    const staff = await Staff.findById(staffId);
    if (!staff) {
      return res.status(404).json({ success: false, error: 'staff not found.' });
    }
    const advanceCashIndex = staff.advance.findIndex(cash => cash._id.toString() === advanceCashId);
    if (advanceCashIndex === -1) {
      return res.status(404).json({ success: false, error: 'advance cash not found within the staff.' });
    }
    staff.advance.splice(advanceCashIndex, 1);
    await staff.save();
    return res.status(200).json({ success: true, message: 'advance cash deleted successfully.' });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
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
  staffAttendanceEdit ,
  handleAllStaffHIstory,
  StaffAttendanceById,
  handleStaffSalaryControll,
  handleStaffSalaryById,
  handleStaffEditing,
  handleDeleteStaff,
  handleStaffAttendanceSheet,
  handleAdvanceHistoryOfStaff,
  handleDeleteStaffAdvance
};
