const asyncHandler = require("express-async-handler");
const Citizen = require("../models/citizenModel");

const createCitizen = asyncHandler(async (req, res) => {
  const {
    idNumber,
    name,
    last_name,
    date_of_birth,
    date_of_issue,
    date_of_expiry,
  } = req.body;
  const citizenExists = await Citizen.findOne({
    identification_number: idNumber,
  });

  if (citizenExists) {
    // Update the existing citizen's information
    citizenExists.name = name || citizenExists.name;
    citizenExists.last_name = last_name || citizenExists.last_name;
    citizenExists.date_of_birth = date_of_birth || citizenExists.date_of_birth;
    citizenExists.date_of_issue = date_of_issue || citizenExists.date_of_issue;
    citizenExists.date_of_expiry =
      date_of_expiry || citizenExists.date_of_expiry;

    await citizenExists.save();

    try {
      res.status(200).json(citizenExists);
    } catch (error) {
      res.status(400).json({ error: "Unable to Update" });
    }
  } else {
    // Create a new citizen if one with the same identification number doesn't exist
    const newCitizen = await Citizen.create({
      identification_number: idNumber,
      name,
      last_name,
      date_of_birth,
      date_of_issue,
      date_of_expiry,
    });

    try {
      res.status(201).json(newCitizen);
    } catch (error) {
      res.status(400).json({ error: "Unable to Save" });
    }
  }
});

const editCitizen = async (req, res) => {
  console.log("edit citizen");
  const updatedData = req.body;
  console.log(updatedData);
  try {
    const citizen = await Citizen.findOne({
      identification_number: req.params.id,
    });

    if (!citizen) {
      return res.status(404).json({ message: "Citizen not found" });
    }
    if (updatedData.name) {
      citizen.name = updatedData.name;
    }
    if (updatedData.last_name) {
      citizen.last_name = updatedData.last_name;
    }
    if (updatedData.date_of_birth) {
      citizen.date_of_birth = updatedData.date_of_birth;
    }
    if (updatedData.date_of_expiry) {
      citizen.date_of_expiry = updatedData.date_of_expiry;
    }
    if (updatedData.date_of_issue) {
      citizen.date_of_issue = updatedData.date_of_issue;
    }

    await citizen.save();
    res.status(200).json({ message: "Citizen updated successfully", citizen });
  } catch (error) {
    console.error("Error editing citizen:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getCitizen = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      res.status(404);
      throw new Error("Citizen ID not provided");
    }

    const citizen = await Citizen.findOne({ identification_number: id });

    if (citizen) {
      res.json(citizen);
    } else {
      // Send an empty object as the response when citizen is not found
      res.json({});
    }
  } catch (error) {
    // Handle other errors or log them if needed
    console.error("Error fetching citizen:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getAllCitizens = async (req, res) => {
  try {
    const allCitizens = await Citizen.find({});

    // Send the array of citizens as the response
    res.json(allCitizens);
  } catch (error) {
    // Handle other errors or log them if needed
    console.error("Error fetching all citizens:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const deleteCitizen = async (req, res) => {
  try {
    console.log("IN DELETE CALL");
    console.log(req.params);

    const id_number = req.params.id;
    // Use a try-catch block for MongoDB operations
    try {
      const citizen = await Citizen.findOne({
        identification_number: id_number,
      });

      if (citizen) {
        console.log("CITIZEN", citizen);
        await Citizen.findByIdAndDelete(citizen.id);
        res.json({ message: "Citizen removed" });
      } else {
        res.status(404);
        throw new Error("Citizen not found");
      }
    } catch (mongoError) {
      // Handle MongoDB errors
      console.error("MongoDB Error:", mongoError);
      res.status(500).json({ error: "Internal Server Error" });
    }
  } catch (error) {
    // Handle any other errors
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createCitizen,
  getCitizen,
  deleteCitizen,
  editCitizen,
  getAllCitizens,
};
