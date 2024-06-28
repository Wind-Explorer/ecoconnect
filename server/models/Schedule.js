module.exports = (sequelize, DataTypes) => {
    const Schedule = sequelize.define("Schedule", {
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
            tableName: 'schedule'
        });
    return Schedule;
}