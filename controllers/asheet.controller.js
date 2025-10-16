"use strict";
const model = require("../models/index");
const { ReE, ReS } = require("../utils/util.service.js");
const { Op, Sequelize } = require("sequelize");
const XLSX = require("xlsx");

const XLSX = require("xlsx"); // npm install xlsx

// Create / Upload ASheet (Excel JSON)
const createASheet = async (req, res) => {
  try {
    // Use Excel file instead of req.body
    if (!req.file) return ReE(res, "Excel file is required", 400);

    // 🔹 Read Excel file
    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // Convert sheet to JSON, keep empty cells as null
    const dataArray = XLSX.utils.sheet_to_json(sheet, { defval: null });

    if (!dataArray.length) return ReE(res, "No data found in Excel", 400);

    const duplicateDetails = [];
    const nullFieldDetails = [];
    const validDetails = [];

    const results = await Promise.all(
      dataArray.map(async (data, index) => {
        try {
          const payload = {
            sr: data.sr ?? null,
            sourcedFrom: data.sourcedFrom ?? null,
            sourcedBy: data.sourcedBy ?? null,
            dateOfConnect: data.dateOfConnect ?? null,
            businessName: data.businessName ?? null,
            contactPersonName: data.contactPersonName ?? null,
            mobileNumber: data.mobileNumber ? String(data.mobileNumber) : null,
            address: data.address ?? null,
            email: data.email ?? null,
            businessSector: data.businessSector ?? null,
            zone: data.zone ?? null,
            landmark: data.landmark ?? null,
            existingWebsite: data.existingWebsite ?? null,
            smmPresence: data.smmPresence ?? null,
            meetingStatus: data.meetingStatus ?? null,
            userId: data.userId ?? req.user?.id ?? null,
          };

          // Null Field Check (for reporting only)
          const nullFields = Object.keys(payload).filter(
            (key) => payload[key] === null && key !== "userId"
          );
          if (nullFields.length > 0) {
            nullFieldDetails.push({
              row: index + 1,
              nullFields,
              rowData: payload,
            });
          }

          // Duplicate Check
          const whereClause = {
            userId: payload.userId,
            businessName: payload.businessName,
          };
          if (payload.mobileNumber) whereClause.mobileNumber = payload.mobileNumber;
          if (payload.email) whereClause.email = payload.email;

          const existing = await model.ASheet.findOne({ where: whereClause });
          if (existing) {
            duplicateDetails.push({
              row: index + 1,
              reason: "Duplicate record",
              rowData: payload,
            });
            return { success: false, type: "duplicate", data: payload };
          }

          // Insert Valid Record
          const record = await model.ASheet.create(payload);
          validDetails.push({ row: index + 1, rowData: record });
          return { success: true, type: "valid", data: record };
        } catch (err) {
          console.error(`Error inserting row ${index + 1}:`, err);
          return { success: false, type: "invalid", error: err.message, data };
        }
      })
    );

    return ReS(
      res,
      {
        success: true,
        summary: {
          total: dataArray.length,
          created: validDetails.length,
          duplicates: duplicateDetails.length,
          invalid: 0, // same as original
          nullFields: nullFieldDetails.length,
        },
        data: {
          duplicates: duplicateDetails,
          invalid: [], // keep format same
          nullFields: nullFieldDetails,
          valid: validDetails,
        },
      },
      201
    );
  } catch (error) {
    console.error("ASheet Create Error:", error);
    return ReE(res, error.message, 500);
  }
};

module.exports.createASheet = createASheet;


// Update ASheet fields
const updateASheetFields = async (req, res) => {
  try {
    const record = await model.ASheet.findByPk(req.params.id);
    if (!record) return ReE(res, "ASheet record not found", 404);

    const allowedFields = [
      "sr", "sourcedFrom", "sourcedBy", "dateOfConnect", "businessName",
      "contactPersonName", "mobileNumber", "address", "email",
      "businessSector", "zone", "landmark", "existingWebsite",
      "smmPresence", "meetingStatus", "userId"
    ];

    const updates = {};
    for (const f of allowedFields) {
      if (req.body[f] !== undefined) updates[f] = req.body[f];
    }

    if (!Object.keys(updates).length) {
      return ReE(res, "No fields to update", 400);
    }

    await record.update(updates);
    return ReS(res, { success: true, data: record }, 200);
  } catch (error) {
    console.error("ASheet Update Error:", error);
    return ReE(res, error.message, 500);
  }
};
module.exports.updateASheetFields = updateASheetFields;

// Get all ASheets
// Get all ASheets
const getASheets = async (req, res) => {
  try {
    // Fetch all ASheet records, including null values
    const records = await model.ASheet.findAll({
      raw: true,
      attributes: [
        "id",
        "sr",
        "sourcedFrom",
        "sourcedBy",
        "dateOfConnect",
        "businessName",
        "contactPersonName",
        "mobileNumber",
        "address",
        "email",
        "businessSector",
        "zone",
        "landmark",
        "existingWebsite",
        "smmPresence",
        "meetingStatus",
        "userId",
        "createdAt",
        "updatedAt",
      ],
    });

    // Fetch active users
    const users = await model.User.findAll({
      where: { isDeleted: false }, // or isActive if you have that field
      attributes: ["id", "firstName", "lastName", "email"],
      raw: true,
    });

    // Add virtual 'name' field in JS and sort by it
    const usersWithName = users
      .map((u) => ({
        ...u,
        name: `${u.firstName} ${u.lastName}`.trim(),
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    return ReS(res, { success: true, data: records, users: usersWithName }, 200);
  } catch (error) {
    console.error("ASheet Fetch All Error:", error);
    return ReE(res, error.message, 500);
  }
};

module.exports.getASheets = getASheets;


// Get single ASheet
const getASheetById = async (req, res) => {
  try {
    const record = await model.ASheet.findByPk(req.params.id);
    if (!record) return ReE(res, "ASheet record not found", 404);
    return ReS(res, { success: true, data: record }, 200);
  } catch (error) {
    console.error("ASheet Fetch Single Error:", error);
    return ReE(res, error.message, 500);
  }
};
module.exports.getASheetById = getASheetById;

const deleteASheet = async (req, res) => {
  try {
    const record = await model.ASheet.findByPk(req.params.id);
    if (!record) return ReE(res, "ASheet record not found", 404);

    await record.destroy();
    return ReS(res, { success: true, message: "ASheet record deleted successfully" }, 200);
  } catch (error) {
    console.error("ASheet Delete Error:", error);
    return ReE(res, error.message, 500);
  }
};

module.exports.deleteASheet = deleteASheet;

const getindividualUserId = async (req, res) => {
  try {
    const userId = req.query.userId || req.params.userId;
    if (!userId) return ReE(res, "userId is required", 400);

    // Find the user
    const user = await model.User.findOne({
      where: { id: userId },
      attributes: ["id", "firstName", "lastName", "email", "mobileNumber"],
      raw: true,
    });

    if (!user) return ReE(res, "User not found", 404);

    // Combine firstName + lastName
    const userName = `${user.firstName} ${user.lastName}`.trim();

    // Find all ASheet rows where sourcedBy matches user's name
    const aSheetData = await model.ASheet.findAll({
      where: {
        sourcedBy: { [Op.iLike]: userName } // case-insensitive match
      },
      order: [["dateOfConnect", "ASC"]],
      raw: true,
    });

    return ReS(res, {
      success: true,
      userId: user.id,
      userName,
      totalRecords: aSheetData.length,
      data: aSheetData,
    });
  } catch (error) {
    console.error("Get ASheet By UserId Error:", error);
    return ReE(res, error.message, 500);
  }
};

module.exports.getindividualUserId = getindividualUserId;