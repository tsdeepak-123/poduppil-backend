const Labour = require("../../models/Admin/LabourModal");
const Attendance = require("../../models/Admin/Attendance");
const Salary = require("../../models/Admin/SalaryModel");
const cloudinary = require("../../Middleware/Cloudinary");
const moment = require("moment");

// This fu  nction handles Labour Adding to database, taking in a request (req) and a response (res) as parameters.

const handleLabourAdding = async (req, res) => {
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
      const LabourExist = await Labour.findOne({ adhar });

      if (LabourExist) {
        return res.json({
          success: false,
          message: "Labour already exists. Please check the Labour List.",
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

      const newLabour = new Labour({
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

      await newLabour.save();

      return res
        .status(200)
        .json({ success: true, message: "Labour added successfully." });
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



const handleLabourEditing = async (req, res) => {
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
            const existingLabour = await Labour.findById(id);
      if (existingLabour) {
        req.body.photo = existingLabour.photo;
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
   
    const updatedLabour = await Labour.findByIdAndUpdate(
      id,
      { $set:{... req.body} },
      { new: true }
    );

    if (!updatedLabour) {
      return res.status(404).json({ error: "Labour not found" });
    }

    res
      .status(200)
      .json({ success: true, messege: "Labour Updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};




// This function handles Labour Details pic from data base, taking in a request (req) and a response (res) as parameters.

const handleLabourDetails = async (req, res) => {
  try {
    const { page = 1, searchTerm = "" } = req.query;
    const limit = 10; // Number of items per page
    const skip = (page - 1) * limit;

    const query = {
      name: { $regex: searchTerm, $options: "i" } // Case-insensitive search by name
    };

    const allLabourData = await Labour.find(query)
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit)

    const totalCount = await Labour.countDocuments(query);

    res.json({ allLabourData, totalCount });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


// ......................Labour single view ......................................

const handleLabourById = async (req, res) => {
  try {
    const id = req.query.id;
    const LabourData = await Labour.findById({ _id: id });
    if (!LabourData) {
      res.json({ success: false, messege: "cant find Labour details " });
    }
    res.json({ LabourData });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


// handle attendance sheeet
const handleAttendanceSheet = async (req, res) => {
  try {
    const { date } = req.query;


    // Find attendance data for the selected date
    const attendanceData = await Attendance.findOne({ date: date });

    if (attendanceData) {
      // Extract laborerIds from attendance data
      const laborerIdsWithAttendance = attendanceData.records.map(record => record.laborerId);

      // Fetch laborers who do not have attendance records for the selected date
      const laborersWithoutAttendance = await Labour.find({
        _id: { $nin: laborerIdsWithAttendance }
      });

      // Send the response with laborer details
      return res.json({ attendanceData: laborersWithoutAttendance });
    } else {
      // If no attendance data found for the selected date, return all laborers
      const allLaborers = await Labour.find({});
      return res.json({ attendanceData: allLaborers });
    }
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ error: error.message });
  }
};



//............................................. labour attendance adding...........................................................
const handleAttendance = async (req, res) => {
  try {
    const { selectedValues, date } = req.body;
    let attendanceDocument = await Attendance.findOne({ date: date });

    if (!attendanceDocument) {
      attendanceDocument = new Attendance({ date: date, records: [] });
    }

    if (!attendanceDocument) {
      res.status(500).json({ success: false, message: "Server error" });
      return;
    }

    for (const laborerId in selectedValues) {
      const status = selectedValues[laborerId];
      const existingRecordIndex = attendanceDocument.records.findIndex(
        (record) => record.laborerId.toString() === laborerId
      );

      if (existingRecordIndex !== -1) {
        // Update existing record
        attendanceDocument.records[existingRecordIndex].status = status;
      } else {
        // Add new record
        attendanceDocument.records.push({ laborerId, status });
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

const handleAttendanceList = async (req, res) => {
  try {
    const currentDate = moment();
    const formattedDate = currentDate.format("YYYY-MM-DD");
    const LabourAttendance = await Attendance.find({ date: formattedDate });
    if (LabourAttendance.length === 0) {
      res.json({ message: "Attendance not found" });
    } else {
      const promises = LabourAttendance.map(async (attendanceDocument) => {
        for (const record of attendanceDocument.records) {
          const laborerData = await Labour.findById(record.laborerId);
          record.laborerId = laborerData;
        }
      });
      await Promise.all(promises);

      res.status(200).json({
        message: "Attendance retrieved successfully",
        LabourAttendance,
      });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// .......................................calculate salary using attendance..................................................
const salarycalculationoflabour = async (req, res) => {
  try {
    const { laborId } = req.query;

    const LaborData = await Labour.findById({ _id: laborId });

    if (!LaborData) {
      return res.status(404).json({
        message: "Labour not found.",
      });
    }

    if (LaborData.lastsalaryDate) {
      LaborData.lastsalaryDate.setDate(LaborData.lastsalaryDate.getDate() + 1);
    }

    const endDate = new Date();
    const startDate = new Date(LaborData.lastsalaryDate || LaborData.date);

    const attendanceRecords = await Attendance.find({
      "records.laborerId": laborId,
      date: { $gte: startDate, $lte: endDate },
    });

    if (!attendanceRecords) {
      return res.status(404).json({
        message:
          "Labour attendance records not found for the specified period.",
      });
    }

    const attendanceStatus = {
      absent: 0,
      halfday: 0,
      present: 0,
    };

    attendanceRecords.forEach((record) => {
      record.records.forEach((attendanceRecord) => {
        if (attendanceRecord.laborerId.equals(laborId)) {
          attendanceStatus[attendanceRecord.status]++;
        }
      });
    });

    const salary =
      LaborData?.salary * attendanceStatus?.present +
      (LaborData?.salary * attendanceStatus?.halfday) / 2;

    // Calculate total reduced amount of advance
    const totalAdvance = LaborData.advance.reduce((total, advance) => {
      return total + advance.amount;
    }, 0);
    console.log(totalAdvance);

    const salaryData = {
      LabourData: LaborData,
      present: attendanceStatus?.present ?? 0,
      halfday: attendanceStatus?.halfday ?? 0,
      absent: attendanceStatus?.absent ?? 0,
      totalAdvance: totalAdvance, // Send the total reduced amount of advance to frontend
      lastweek: salary,
      balance: salary - totalAdvance, // Adjust balance calculation accordingly
    };

    return res.json({ salaryData, message: "salarydata not found." });
  } catch (error) {
    res
      .status(500)
      .json({ message: "An error occurred during salary calculation." });
  }
};


//............................ salary calculation ..........................................

const salarycalculation = async (req, res) => {
  try {
    const { laborId } = req.query;
    const { laborSalarydate } = req.query;

    const LaborData = await Labour.findById({ _id: laborId });

    if (!LaborData) {
      return res.status(404).json({
        message: "Labour not found.",
      });
    }

    const endDate = new Date(laborSalarydate);
    const today = new Date();
    let startDate;

    if (LaborData.lastsalaryDate) {
      startDate = new Date(LaborData.lastsalaryDate);
      startDate.setDate(startDate.getDate() + 1);
    } else {
      startDate = new Date(LaborData.date);
    }
    const startdatePart = startDate.toISOString().slice(0, 10);
    const enddatePart = endDate.toISOString().slice(0, 10);
    const todayPart = today.toISOString().slice(0, 10);

    if (todayPart == enddatePart) {
      endDate.setDate(endDate.getDate() + 1);
    }

    const attendanceRecords = await Attendance.find({
      "records.laborerId": laborId,
      date: { $gte: startDate, $lte: endDate },
    });

    if (!attendanceRecords) {
      return res.status(404).json({
        message:
          "Labour attendance records not found for the specified period.",
      });
    }

    const attendanceStatus = {
      absent: 0,
      halfday: 0,
      present: 0,
    };

    attendanceRecords.forEach((record) => {
      record.records.forEach((attendanceRecord) => {
        if (attendanceRecord.laborerId.equals(laborId)) {
          attendanceStatus[attendanceRecord.status]++;
        }
      });
    });

    if (todayPart == enddatePart) {
      endDate.setDate(endDate.getDate() - 1);
    }
    const salary =
      LaborData?.salary * attendanceStatus?.present +
      (LaborData?.salary * attendanceStatus?.halfday) / 2;

    const SalaryData = await Salary.findOne({ laborerId: laborId });

    if (SalaryData) {
      const newRecord = {
        calculateFrom: startDate,
        calculateTo: endDate,
        present: attendanceStatus.present,
        halfday: attendanceStatus.halfday,
        absent: attendanceStatus.absent,
        date: new Date(),
        totalSalary: salary,
        advance: LaborData.advance,
        updatedSalary: salary - LaborData.advance,
      };
      SalaryData.records.addToSet(newRecord);
      await SalaryData.save();
    } else {
      const salaryofLabour = new Salary({
        laborerId: laborId,
        records: [
          {
            calculateFrom: startDate,
            calculateTo: endDate,
            present: attendanceStatus.present ?? 0,
            halfday: attendanceStatus.halfday ?? 0,
            absent: attendanceStatus.absent ?? 0,
            date: new Date(),
            totalSalary: salary,
            advance: LaborData.advance,
            updatedSalary: salary - LaborData.advance,
          },
        ],
      });

      await salaryofLabour.save();

      if (salary > LaborData.advance) {
        await Labour.findByIdAndUpdate({ _id: LaborData._id }, { advance: 0 });
      } else {
        await Labour.findByIdAndUpdate(
          { _id: LaborData._id },
          { advance: LaborData.advance - salary }
        );
      }
    }

    const salaryDatas = await Salary.findOne({ laborerId: laborId }).populate(
      "laborerId"
    );
    salaryDatas.records.sort((a, b) => b.calculateTo - a.calculateTo);
    const latestRecord = salaryDatas.records[0];

    await Labour.findByIdAndUpdate(
      { _id: LaborData._id },
      { lastsalaryDate: latestRecord.calculateTo }
    );
    res.status(200).json({ message: "Salary calculated successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "An error occurred during salary calculation." });
  }
};

//.................................  attendance taking using id................................

const labourAttendanceById = async (req, res) => {
  try {
    console.log(req.query.year);
    const labourId = req.query.labourId;
    const month = req.query.month;
    const year = req.query.year; 
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, parseInt(month) + 1, 0);

    const attendanceRecords = await Attendance.find({
      "records.laborerId": labourId,
      date: {
        $gte: firstDayOfMonth,
        $lte: lastDayOfMonth
      }
    });
    
    const laborData = {};
    attendanceRecords.forEach((record) => {
      record.records.forEach((attendanceRecord) => {
        if (attendanceRecord.laborerId.equals(labourId)) {
          const date = moment(record.date).format("YYYY-MM-DD");
          const status = attendanceRecord.status;
          laborData[date] = status;
        }
      });
    });
    
    res.status(200).json({ laborData });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};



// ...............................giving advance to labour --------------------------------------------

const handleLabourAdvance = async (req, res) => {
  try {
    const id = req.query.id;
    const { amount, date } = req.body;

    // Validate request data
    if (!id || !amount || !date) {
      return res.status(400).json({ message: "Invalid request data" });
    }

    // Find the Labour document by ID
    let labourData = await Labour.findById(id);

    // If no Labour document found with the provided ID, return a response
    if (!labourData) {
      return res.status(404).json({ message: "No labour found" });
    }

    // If the advance field is not an array, initialize it as an empty array
    if (!Array.isArray(labourData.advance)) {
      labourData.advance = [];
    }

    // Create a new advance object with the provided amount and date
    const newAdvance = {
      amount: parseFloat(amount), // Assuming amount is a string representation of a number
      date: new Date(date) // Convert date string to a Date object
    };

    // Push the new advance object into the advance array of LabourData
    labourData.advance.push(newAdvance);

    // Save the updated Labour document
    await labourData.save();

    // Respond with a success message
    res.json({ message: "Advance updated successfully" });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};







//...........................  salary history of labour ...............................

const handleLabourHIstory = async (req, res) => {
  try {
    const { labourId } = req.query;
    const LabourSalaryData = await Salary.findOne({
      laborerId: labourId,
    }).populate("laborerId");
    if (!LabourSalaryData) {
      res.json({ message: "No labour found" });
    }

    res.status(200).json({ message: "successfull", LabourSalaryData });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};
//...........................  salary history of all labour ...............................

const handleAllLabourHIstory = async (req, res) => {
  try {
    const LabourSalaryData = await Salary.find({}).populate("laborerId");

    if (!LabourSalaryData) {
      res.json({ message: "No labour found" });
    }

    const updatedLabourSalaryData = LabourSalaryData.map((labour) => {
      if (labour.records.length > 0) {
        const sortedRecords = labour.records.sort(
          (a, b) => new Date(b.date) - new Date(a.date)
        );
        const latestRecord = sortedRecords[0];
        labour.records = [latestRecord];
      }
      return labour;
    }); // Closing parenthesis should be here

    res.status(200).json({ message: "successfull", updatedLabourSalaryData });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

//............................labour salary by id ...........................................
const handleLabourSalaryById = async (req, res) => {
  try {
    const id = req.query.id;
    const LabourSalaryData = await Salary.find({ laborerId: id }).populate(
      "laborerId"
    );

    if (!LabourSalaryData || LabourSalaryData.length === 0) {
      return res
        .status(404)
        .json({ message: "No labour found with the given labourId" });
    }

    res
      .status(200)
      .json({
        message: "Successfully found laborer's salary data",
        LabourSalaryData,
      });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

// ............................. attendace edit .........................................

const labourAttendanceEdit = async (req, res) => {
  try {
    const { labourId, status, date } = req.body;

    const attendanceRecord = await Attendance.findOne({
      date: date,
    });

    if (attendanceRecord) {
      const matchingRecord = attendanceRecord.records.find(
        (r) => r.laborerId == labourId
      );

      if (matchingRecord) {
        matchingRecord.status = status;
      } else {
        attendanceRecord.records.push({ laborerId: labourId, status });
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

//--------------------here is the changing status of labour

const handleSalaryControll = async (req, res) => {
  try {
    const id = req.query.id;
    const status = req.body.status;

    await Salary.findOneAndUpdate(
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



const handleDeleteLabour = async (req, res) => {
  try { 
    const id = req.query.id;
    const deletedLabour = await Labour.findByIdAndDelete(id);

    if (!deletedLabour) {
      return res
        .status(404)
        .json({ success: false, message: "Labour not found" });
    }

    return res.json({
      success: true,
      message: "Labour deleted successfully",
    });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
};


//advance of labour

const handleAdvanceHistoryOfLabour = async (req, res) => {
  try {
    const labourId = req.query.id;
    const labour = await Labour.findById(labourId);
    if (!labour) {
      return res.status(404).json({ message: "labour not found" });
    }
    const sortedPaymentRecords = labour.advance.sort((a, b) => a.date - b.date);

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

const handleDeleteLabourAdvance = async (req, res) => {
  try {
    const labourId = req.query.labourId;
    const advanceCashId = req.query.id;
    if (!labourId || !advanceCashId) {
      return res.status(400).json({ success: false, error: 'labour ID and advance cash ID are required.' });
    }
    const labour = await Labour.findById(labourId);
    if (!labour) {
      return res.status(404).json({ success: false, error: 'labour not found.' });
    }
    const advanceCashIndex = labour.advance.findIndex(cash => cash._id.toString() === advanceCashId);
    if (advanceCashIndex === -1) {
      return res.status(404).json({ success: false, error: 'advance cash not found within the labour.' });
    }
    labour.advance.splice(advanceCashIndex, 1);
    await labour.save();
    return res.status(200).json({ success: true, message: 'advance cash deleted successfully.' });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
};



module.exports = {
  handleLabourAdding,
  handleLabourEditing,
  handleLabourDetails,
  handleLabourById,
  handleAttendance,
  salarycalculationoflabour,
  salarycalculation,
  labourAttendanceById,
  handleAttendanceList,
  handleLabourAdvance,
  handleLabourHIstory,
  handleAllLabourHIstory,
  labourAttendanceEdit,
  handleSalaryControll,
  handleLabourSalaryById,
  handleDeleteLabour ,
  handleAttendanceSheet,
  handleAdvanceHistoryOfLabour,
  handleDeleteLabourAdvance
};
