const { DataTypes } = require('sequelize');

module.exports = (sequelize)  => {
  const Events = sequelize.define("Events", {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    time: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    slotsAvailable: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    evtPicture: {
      type: DataTypes.BLOB("long"),
      allowNull: true,
    },
  }, {
    tableName: "events",
    timestamps: true,
  });
  return Events;
}
