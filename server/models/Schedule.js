const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    const Schedule = sequelize.define(
        "Schedule",
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                allowNull: false,
                primaryKey: true,
            },
            dateTime: {
                type: DataTypes.DATE,
                allowNull: false
            },
            location: {
                type: DataTypes.TEXT,
                allowNull: false
            },
            postalCode: {
                type: DataTypes.INTEGER(6),
                allowNull: false
            },
            status: {
                type: DataTypes.TEXT,
                allowNull: false
            },
        },
        {
            tableName: "schedule"
        });
    return Schedule;
};