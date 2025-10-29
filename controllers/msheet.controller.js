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

    // aSheetId is mandatory
    if (!aSheetId) {
      return ReE(res, "aSheetId is required.", 400);
    }

    // Find existing record by aSheetId
    const existing = await model.MSheet.findOne({ where: { aSheetId } });

    // Prepare data (any missing field = null)
    const data = {
      aSheetId,
      rmAssignedName: rmAssignedName || null,
      rmAssignedContact: rmAssignedContact || null,
      domainName: domainName || null,
      websiteStartDate: websiteStartDate || null,
      websiteCompletionDate: websiteCompletionDate || null,
      trainingAndHandoverStatus: trainingAndHandoverStatus || null,
      servicesOpted: servicesOpted || null,
      clientFeedback: clientFeedback || null,
      renewalDate: renewalDate || null,
      renewalStatus: renewalStatus || null,
    };

    let result, message;

    if (existing) {
      // Update existing record
      await existing.update(data);
      result = existing;
      message = "MSheet record updated successfully.";
    } else {
      // Create new record
      result = await model.MSheet.create(data);
      message = "MSheet record created successfully.";
    }

    return ReS(res, { success: true, message, data: result }, 200);
  } catch (error) {
    console.error("upsertMSheet Error:", error);
    return ReE(res, error.message, 500);
  }
};

module.exports.upsertMSheet = upsertMSheet;
