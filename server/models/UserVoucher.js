const { DataTypes } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    const UserVoucher = sequelize.define(
        "UserVoucher",
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                allowNull: false,
                primaryKey: true,
            },
            userId: {
                type: DataTypes.UUID,
                allowNull: false,
            },
            voucherId: {
                type: DataTypes.UUID,
                allowNull: false,
            },
        },
        {
            tableName: "user_vouchers",
            timestamps: true,
        });

    return UserVoucher;
};