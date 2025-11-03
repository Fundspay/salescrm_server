"use strict";
const model = require("../models/index");
const { ReE, ReS } = require("../utils/util.service.js");

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
    const existing = await model.MSheet.findOne({ where: { aSheetId } });

    let result, message;

    if (existing) {
      // Update only fields that are present in request body
      const updatedData = {};
      if (rmAssignedName !== undefined) updatedData.rmAssignedName = rmAssignedName;
      if (rmAssignedContact !== undefined) updatedData.rmAssignedContact = rmAssignedContact;
      if (domainName !== undefined) updatedData.domainName = domainName;
      if (websiteStartDate !== undefined) updatedData.websiteStartDate = websiteStartDate;
      if (websiteCompletionDate !== undefined) updatedData.websiteCompletionDate = websiteCompletionDate;
      if (trainingAndHandoverStatus !== undefined) updatedData.trainingAndHandoverStatus = trainingAndHandoverStatus;
      if (servicesOpted !== undefined) updatedData.servicesOpted = servicesOpted;
      if (clientFeedback !== undefined) updatedData.clientFeedback = clientFeedback;
      if (renewalDate !== undefined) updatedData.renewalDate = renewalDate;
      if (renewalStatus !== undefined) updatedData.renewalStatus = renewalStatus;

      await existing.update(updatedData);
      result = existing;
      message = "MSheet record updated successfully.";
    } else {
      // Create new record with whatever is sent
      result = await model.MSheet.create({
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

