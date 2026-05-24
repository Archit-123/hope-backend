import Nominee from "../models/Nominee.js";
import User from "../models/User.js";
import Otp from "../models/Otp.js";
import nodemailer from "nodemailer";

// Add nominee
export const addNominee = async (req, res) => {
  try {
    const nominee = await Nominee.create({
      user: req.user._id,

      nomineeName: req.body.nomineeName,

      email: req.body.email.toLowerCase(),

      gender: req.body.gender,

      note: req.body.note,
    });

    res.status(201).json(nominee);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get logged-in user's nominees
export const getMyNominees = async (req, res) => {
  try {
    const nominees = await Nominee.find({
      user: req.user._id,
    }).sort({
      createdAt: -1,
    });

    res.status(200).json(nominees);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

//Update Nominee
export const updateNominee = async (req, res) => {
  try {
    const nominee = await Nominee.findById(req.params.id);

    if (!nominee) {
      return res.status(404).json({
        message: "Nominee not found",
      });
    }

    // security check
    if (nominee.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    nominee.nomineeName = req.body.nomineeName;

    nominee.email = req.body.email.toLowerCase();

    nominee.gender = req.body.gender;

    nominee.note = req.body.note;

    await nominee.save();

    res.status(200).json(nominee);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

//delete nominee
export const deleteNominee = async (req, res) => {
  try {
    const nominee = await Nominee.findById(req.params.id);

    if (!nominee) {
      return res.status(404).json({
        message: "Nominee not found",
      });
    }

    // owner check
    if (nominee.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    await nominee.deleteOne();

    res.status(200).json({
      success: true,
      id: nominee._id,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Search Nomine
export const searchNominees = async (req, res) => {
  try {
    const search = req.query.q || "";

    const nominees = await Nominee.find({
      nomineeName: {
        $regex: search,
        $options: "i",
      },
    })
      .populate("user", "username email")
      .sort({
        createdAt: -1,
      });

    res.status(200).json(nominees);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Notes for me
export const getNotesForMe = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id);

    const notes = await Nominee.find({
      email: currentUser.email,

      user: {
        $ne: req.user._id,
      },
    })
      .populate("user", "username email")
      .sort({
        createdAt: -1,
      });

    res.status(200).json(notes);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Send OTP
export const sendOtp = async (req, res) => {
  try {
    const { noteId } = req.body;

    const nominee = await Nominee.findById(noteId).populate(
      "user",
      "email username",
    );

    if (!nominee) {
      return res.status(404).json({
        message: "Note not found",
      });
    }

    // creator email (User1)
    const creatorEmail = nominee.user.email;

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await Otp.deleteMany({
      email: creatorEmail,
    });

    await Otp.create({
      email: creatorEmail,

      otp,

      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    const transporter = nodemailer.createTransport({
      service: "gmail",

      auth: {
        user: process.env.EMAIL_USER,

        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,

      to: creatorEmail,

      subject: "Verification OTP",

      text: `OTP: ${otp}`,
    });

    res.status(200).json({
      message: "OTP sent",
    });
  } catch (error) {
    console.log("OTP ERROR:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// Verify otp
export const verifyOtp = async (req, res) => {
  try {
    const { otp, noteId } = req.body;

    console.log("Received:", {
      otp,
      noteId,
    });

    const nominee = await Nominee.findById(noteId).populate("user", "email");

    if (!nominee) {
      return res.status(404).json({
        message: "Note not found",
      });
    }

    const creatorEmail = nominee.user.email;

    console.log("Creator Email:", creatorEmail);

    const allOtps = await Otp.find();

    console.log("Stored OTPs:", allOtps);

    const found = await Otp.findOne({
      email: creatorEmail,

      otp: otp.toString(),
    });

    console.log("Found OTP:", found);
    if (!found) {
      return res.status(400).json({
        message: "Invalid OTP",
      });
    }

    if (new Date() > found.expiresAt) {
      return res.status(400).json({
        message: "OTP expired",
      });
    }

    await Otp.deleteOne({
      _id: found._id,
    });

    console.log("Sending note:", nominee.note);
    res.status(200).json({
      verified: true,

      note: nominee.note,

      nomineeName: nominee.nomineeName,
    });
  } catch (error) {
    console.log("VERIFY ERROR:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};
