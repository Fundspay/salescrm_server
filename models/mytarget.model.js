"use strict";
module.exports = (sequelize, Sequelize) => {
  const MyTarget = sequelize.define(
    "MyTarget",
    {
      id: { type: Sequelize.BIGINT, autoIncrement: true, primaryKey: true },
      userId: { type: Sequelize.BIGINT, allowNull: false },
      targetDate: { type: Sequelize.DATEONLY, allowNull: false },
      c1Target: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      c2Target: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      c3Target: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      c4Target: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      subscriptionTarget: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      token: { type: Sequelize.STRING, allowNull: true },

      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    },
    {
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ["userId", "targetDate"], // unique per user per day
        },
      ],
    }
  );

  // 🔹 Associations
  MyTarget.associate = function (models) {
    // Belongs to User
    MyTarget.belongsTo(models.User, {
      foreignKey: "userId",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
      constraints: true,
    });
  };

  return MyTarget;
};
