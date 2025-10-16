"use strict";
module.exports = (sequelize, Sequelize) => {
  const ASheet = sequelize.define(
    "ASheet",
    {
      id: { type: Sequelize.BIGINT, autoIncrement: true, primaryKey: true },

      // 🔹 Business fields
      sr: { type: Sequelize.INTEGER, allowNull: true },
      sourcedFrom: { type: Sequelize.STRING, allowNull: true },
      sourcedBy: { type: Sequelize.STRING, allowNull: true },
      dateOfConnect: { type: Sequelize.DATEONLY, allowNull: true },
      businessName: { type: Sequelize.STRING, allowNull: true },
      contactPersonName: { type: Sequelize.STRING, allowNull: true },
      mobileNumber: { type: Sequelize.STRING, allowNull: true },
      address: { type: Sequelize.STRING, allowNull: true },
      email: { type: Sequelize.STRING, allowNull: true },
      businessSector: { type: Sequelize.STRING, allowNull: true },
      zone: { type: Sequelize.STRING, allowNull: true },
      landmark: { type: Sequelize.STRING, allowNull: true },
      existingWebsite: { type: Sequelize.STRING, allowNull: true },
      smmPresence: { type: Sequelize.STRING, allowNull: true },
      meetingStatus: { type: Sequelize.STRING, allowNull: true },

      // 🔹 Foreign key (User)
      userId: { type: Sequelize.BIGINT, allowNull: true },

      // 🔹 System fields
      isActive: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    },
    {
      timestamps: true, 
    }
  );

  // 🔹 Association: ASheet belongs to User
  ASheet.associate = function (models) {
    ASheet.belongsTo(models.User, {
      foreignKey: "userId",
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
    });
  };

  return ASheet;
};
