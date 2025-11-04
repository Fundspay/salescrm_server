"use strict";
const model = require("../models/index");
const { ReE, ReS } = require("../utils/util.service.js");
const { Op } = require("sequelize");

const upsertMSheet = async (req, res) => {
  try {
    const {
      aSheetId,
      rmAssignedName,
      rmAssignedContact,
      domainName,
      websiteStartDate,
      websiteCompletionDate,
      trainingAndHandoverStatus,
      servicesOpted,
      clientFeedback,
      renewalDate,
      renewalStatus,
    } = req.body;

    if (!aSheetId) {
      return ReE(res, "aSheetId is required.", 400);
    }

    // Find existing record by aSheetId
    let existing = await model.MSheet.findOne({ where: { aSheetId } });

    // Prepare only fields present in request body
    const updatedData = {};
    if (rmAssignedName !== undefined) updatedData.rmAssignedName = rmAssignedName;
    if (rmAssignedContact !== undefined) updatedData.rmAssignedContact = rmAssignedContact;
    if (domainName !== undefined) updatedData.domainName = domainName;
    if (websiteStartDate !== undefined) updatedData.websiteStartDate = websiteStartDate || null; // handle empty string
    if (websiteCompletionDate !== undefined) updatedData.websiteCompletionDate = websiteCompletionDate || null;
    if (trainingAndHandoverStatus !== undefined) updatedData.trainingAndHandoverStatus = trainingAndHandoverStatus;
    if (servicesOpted !== undefined) updatedData.servicesOpted = servicesOpted;
    if (clientFeedback !== undefined) updatedData.clientFeedback = clientFeedback;
    if (renewalDate !== undefined) updatedData.renewalDate = renewalDate || null;
    if (renewalStatus !== undefined) updatedData.renewalStatus = renewalStatus;

    let result, message;

    if (existing) {
      // Update only provided fields
      await existing.update(updatedData);
      result = existing;
      message = "MSheet record updated successfully.";
    } else {
      // Create new record with provided fields
      result = await model.MSheet.create({
        aSheetId,
        ...updatedData,
      });
      message = "MSheet record created successfully.";
    }

    return ReS(res, { success: true, message, data: result }, 200);

  } catch (error) {
    console.error("upsertMSheet Error:", error);
    return ReE(res, error.message, 500);
  }
};

module.exports.upsertMSheet = upsertMSheet;

const updateMSheet = async (req, res) => {
  try {
    const { id } = req.params; // MSheet ID from URL
    const {
      rmAssignedName,
      rmAssignedContact,
      domainName,
      websiteStartDate,
      websiteCompletionDate,
      trainingAndHandoverStatus,
      servicesOpted,
      clientFeedback,
      renewalDate,
      renewalStatus,
            aSheetId,
    } = req.body;

    if (!id) {
      return ReE(res, "MSheet id is required in URL.", 400);
    }

    // Find existing MSheet by id
    const existing = await model.MSheet.findByPk(id);

    if (!existing) {
      return ReE(res, "MSheet record not found.", 404);
    }

    // Prepare only fields present in request body
    const updatedData = {};
    if (rmAssignedName !== undefined) updatedData.rmAssignedName = rmAssignedName;
    if (rmAssignedContact !== undefined) updatedData.rmAssignedContact = rmAssignedContact;
    if (domainName !== undefined) updatedData.domainName = domainName;
    if (websiteStartDate !== undefined) updatedData.websiteStartDate = websiteStartDate || null;
    if (websiteCompletionDate !== undefined) updatedData.websiteCompletionDate = websiteCompletionDate || null;
    if (trainingAndHandoverStatus !== undefined) updatedData.trainingAndHandoverStatus = trainingAndHandoverStatus;
    if (servicesOpted !== undefined) updatedData.servicesOpted = servicesOpted;
    if (clientFeedback !== undefined) updatedData.clientFeedback = clientFeedback;
    if (renewalDate !== undefined) updatedData.renewalDate = renewalDate || null;
    if (renewalStatus !== undefined) updatedData.renewalStatus = renewalStatus;
    if (aSheetId !== undefined) updatedData.aSheetId = aSheetId;

    // Update record
    await existing.update(updatedData);

    return ReS(res, { success: true, message: "MSheet record updated successfully.", data: existing }, 200);

  } catch (error) {
    console.error("updateMSheet Error:", error);
    return ReE(res, error.message, 500);
  }
};

module.exports.updateMSheet = updateMSheet;


// ✅ Fetch Single MSheet by ID
var fetchMSheetById = async (req, res) => {
    try {
        const msheet = await model.MSheet.findByPk(req.params.id, {
            include: [
                { model: model.ASheet } // include parent sheet info
            ]
        });

        if (!msheet || !msheet.isActive) return ReE(res, "MSheet not found", 404);

        return ReS(res, { success: true, msheet: msheet.get({ plain: true }) }, 200);

    } catch (error) {
        return ReE(res, error.message, 500);
    }
};
module.exports.fetchMSheetById = fetchMSheetById;

// ✅ Fetch MSheets by User ID (assuming ASheet has userId)
var fetchMSheetsByUserId = async (req, res) => {
    try {
        const msheets = await model.MSheet.findAll({
            include: [
                {
                    model: model.ASheet,
                    where: { userId: req.params.userId },
                    required: true
                }
            ]
        });

        return ReS(res, { success: true, msheets }, 200);

    } catch (error) {
        return ReE(res, error.message, 500);
    }
};
module.exports.fetchMSheetsByUserId = fetchMSheetsByUserId;

// ✅ Fetch All MSheets
var fetchAllMSheets = async (req, res) => {
    try {
        const msheets = await model.MSheet.findAll({
            include: [
                { model: model.ASheet }
            ]
        });

        return ReS(res, { success: true, msheets }, 200);

    } catch (error) {
        return ReE(res, error.message, 500);
    }
};
module.exports.fetchAllMSheets = fetchAllMSheets;


const mgetMSheetsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return ReE(res, "userId is required.", 400);
    }

    // Step 1: Find user by ID
    const user = await model.User.findByPk(userId, {
      attributes: ["firstName", "lastName"],
    });

    if (!user) {
      return ReE(res, "User not found.", 404);
    }

    // Step 2: Build the RM name (trim to avoid mismatches)
    const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim();

    if (!fullName) {
      return ReE(res, "User has no valid name to match.", 400);
    }

    // Step 3: Find all MSheet rows where rmAssignedName matches the user's full name
    const msheets = await model.MSheet.findAll({
      where: {
        rmAssignedName: {
          [Op.iLike]: `%${fullName}%`, // allows partial match (case-insensitive)
        },
      },
      include: [
        {
          model: model.ASheet,
          required: false,
        },
      ],
    });

    // Step 4: Return response
    return ReS(res, {
      success: true,
      total: msheets.length,
      rmName: fullName,
      data: msheets,
    }, 200);

  } catch (error) {
    console.error("getMSheetsByUserId Error:", error);
    return ReE(res, error.message, 500);
  }
};

module.exports.mgetMSheetsByUserId = mgetMSheetsByUserId;



