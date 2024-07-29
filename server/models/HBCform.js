const { DataTypes } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    const HBCform = sequelize.define(
        "HBCform",
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                allowNull: false,
                primaryKey: true,
            },
            electricalBill: {
                type: DataTypes.DECIMAL(7, 2),
                allowNull: false
            },
            waterBill: {
                type: DataTypes.DECIMAL(7, 2),
                allowNull: false
            },
            totalBill: {
                type: DataTypes.DECIMAL(7, 2),
                allowNull: false
            },
            noOfDependents: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            avgBill: {
                type: DataTypes.DECIMAL(7, 2),
                allowNull: false
            },
            ebPicture: {
                type: DataTypes.BLOB("long"),
                allowNull: true,
            },
            wbPicture: {
                type: DataTypes.BLOB("long"),
                allowNull: true,
            },
            userId: {
                type: DataTypes.UUID,
            },
        },
        {
            tableName: "hbcform",
            timestamps: true,
        });

    return HBCform;
}