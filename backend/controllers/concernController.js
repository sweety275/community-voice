import mongoose from "mongoose";
import crypto from "crypto";
import Concern from "../models/Concern.js";
import User from "../models/User.js";

export const createConcern = async (req, res) => {
  try {
    const {
      title,
      category,
      campus,
      house,
      description,
      priority,
      reportingMode,
    } = req.body;

    if (!title || !category || !campus || !description) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields.",
      });
    }

    const isAnonymous = reportingMode === "Anonymous";

    const trackingCode = isAnonymous
      ? `CV-${crypto.randomBytes(16).toString("hex").toUpperCase()}`
      : null;

    const trackingCodeHash = trackingCode
      ? crypto.createHash("sha256").update(trackingCode).digest("hex")
      : undefined;

    const concern = await Concern.create({
      title,
      category,
      campus,
      house,
      description,
      priority,
      reportingMode,
      reporter: isAnonymous ? null : req.user.userId,
      trackingCodeHash,
      statusHistory: [
        {
          status: "Submitted",
          note: "Concern submitted successfully.",
        },
      ],
    });

    const safeConcern = concern.toObject();
    delete safeConcern.trackingCodeHash;

    return res.status(201).json({
      success: true,
      message: "Concern submitted successfully!",
      concern: safeConcern,
      trackingCode,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to submit concern.",
    });
  }
};

export const getMyConcerns = async (req, res) => {
  try {
    const concerns = await Concern.find({
      reporter: req.user.userId,
      reportingMode: { $in: ["Named", "Confidential"] },
    }).select("-__v");

    return res.status(200).json({
      success: true,
      count: concerns.length,
      concerns,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch your concerns.",
    });
  }
};


export const deleteMyConcern = async (req, res) => {
  try {
    const concern = await Concern.findOneAndDelete({
      _id: req.params.id,
      reporter: req.user.userId,
      reportingMode: { $in: ["Named", "Confidential"] }
    });

    if (!concern) {
      return res.status(404).json({
        success: false,
        message: "Concern not found or you are not authorized to delete it."
      });
    }

    return res.status(200).json({
      success: true,
      message: "Your concern was deleted successfully."
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete concern."
    });
  }
};

export const updateConcernStatus = async (req, res) => {
  try {
    const { status, note } = req.body;

    if (note !== undefined && (
      typeof note !== "string" || note.length > 500
    )) {
      return res.status(400).json({
        success: false,
        message: "Note must be text and cannot exceed 500 characters."
      });
    }

    const allowedStatuses = [
      "Under Review",
      "Assigned",
      "In Progress",
      "Resolution Proposed",
      "Resolved",
      "Closed",
      "Reopened"
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid concern status."
      });
    }

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid concern ID."
      });
    }

    const concern = await Concern.findById(req.params.id);

    if (!concern) {
      return res.status(404).json({
        success: false,
        message: "Concern not found."
      });
    }

    // Handlers can update only concerns assigned to them
    if (
      req.user.role === "Handler" &&
      String(concern.assignedTo) !== String(req.user.userId)
    ) {
      return res.status(403).json({
        success: false,
        message: "You can update only concerns assigned to you."
      });
    }

    concern.status = status;
    concern.statusHistory.push({
      status,
      note: note || "",
      updatedAt: new Date()
    });

    await concern.save();

    return res.status(200).json({
      success: true,
      message: "Concern status updated successfully.",
      concern
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update concern status."
    });
  }
};

// Track an anonymous concern using its private tracking code
export const trackAnonymousConcern = async (req, res) => {
  try {
    const { trackingCode } = req.body;

    if (!trackingCode) {
      return res.status(400).json({
        success: false,
        message: "Tracking code is required.",
      });
    }

    const trackingCodeHash = crypto
      .createHash("sha256")
      .update(trackingCode.trim().toUpperCase())
      .digest("hex");

    const concern = await Concern.findOne({
      trackingCodeHash,
      reportingMode: "Anonymous",
    }).select("-trackingCodeHash -__v");

    if (!concern) {
      return res.status(404).json({
        success: false,
        message: "Invalid tracking code or concern not found.",
      });
    }

    return res.status(200).json({
      success: true,
      concern,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to track anonymous concern.",
    });
  }
};

// Delete an anonymous concern using its private tracking code
export const deleteAnonymousConcern = async (req, res) => {
  try {
    const { trackingCode } = req.body;

    if (!trackingCode) {
      return res.status(400).json({
        success: false,
        message: "Tracking code is required.",
      });
    }

    const trackingCodeHash = crypto
      .createHash("sha256")
      .update(trackingCode.trim().toUpperCase())
      .digest("hex");

    const concern = await Concern.findOneAndDelete({
      trackingCodeHash,
      reportingMode: "Anonymous",
    });

    if (!concern) {
      return res.status(404).json({
        success: false,
        message: "Invalid tracking code or concern not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Anonymous concern deleted successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete anonymous concern.",
    });
  }
};


export const assignConcern = async (req, res) => {
  try {
    const { handlerId } = req.body;

    if (!handlerId || !mongoose.isValidObjectId(handlerId)) {
      return res.status(400).json({
        success: false,
        message: "A valid Handler ID is required."
      });
    }

    const handler = await User.findOne({
      _id: handlerId,
      role: "Handler"
    }).select("_id");

    if (!handler) {
      return res.status(404).json({
        success: false,
        message: "Handler not found."
      });
    }

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid concern ID."
      });
    }

    const concern = await Concern.findById(req.params.id);

    if (!concern) {
      return res.status(404).json({
        success: false,
        message: "Concern not found."
      });
    }

    concern.assignedTo = handler._id;
    concern.assignedBy = req.user.userId;
    concern.status = "Assigned";
    concern.statusHistory.push({
      status: "Assigned",
      note: "Concern assigned to a Handler."
    });

    await concern.save();

    return res.status(200).json({
      success: true,
      message: "Concern assigned successfully.",
      concern
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to assign concern."
    });
  }
};

export const getAssignedConcerns = async (req, res) => {
  try {
    const concerns = await Concern.find({
      assignedTo: req.user.userId
    })
      .select("-trackingCodeHash -__v")
      .sort({ updatedAt: -1 });

    return res.status(200).json({
      success: true,
      count: concerns.length,
      concerns
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch assigned concerns."
    });
  }
};
