"use strict";
module.exports = (sequelize, Sequelize) => {
    const User = sequelize.define(
        "User",
        {
            id: { autoIncrement: true, primaryKey: true, type: Sequelize.BIGINT },
            firstName: { type: Sequelize.STRING, allowNull: false },
            lastName: { type: Sequelize.STRING, allowNull: false },
            gender: { type: Sequelize.BIGINT, allowNull: true },
            email: { type: Sequelize.STRING, allowNull: true, unique: true },
            phoneNumber: { type: Sequelize.STRING, allowNull: true, unique: true },
            password: { type: Sequelize.STRING, allowNull: false },
            lastLoginAt: { type: Sequelize.DATE, allowNull: true },
            lastLogoutAt: { type: Sequelize.DATE, allowNull: true },
            createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
            updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
            isDeleted: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
        },
        
    );

    User.associate = function (models) {

        User.belongsTo(models.Gender, {
            foreignKey: "gender",
            onDelete: "RESTRICT",
            onUpdate: "RESTRICT",
            constraints: true,
        });

    
    };

    return User;
};
