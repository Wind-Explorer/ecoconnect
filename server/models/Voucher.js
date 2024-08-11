const { DataTypes } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    const Voucher = sequelize.define(
        "Voucher",
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                allowNull: false,
                primaryKey: true,
            },
            brandLogo: {
                type: DataTypes.BLOB("long"),
                allowNull: true,
            },
            brand: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            description: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            expirationDate: {
                type: DataTypes.DATE,
                allowNull: false,
            },
            quantityAvailable: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            code: {
                type: DataTypes.STRING,
                allowNull: false,
            },
        },
        {
            tableName: "vouchers",
            timestamps: true,
        });

    return Voucher;
};