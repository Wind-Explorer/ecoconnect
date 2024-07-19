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
    Events: {
      type: DataTypes.BLOB("long"),
      allowNull: true,
    },
    slotsAvailable: {
      type: DataTypes.INTEGER,
      allowNull: false,
    }
  }, {
    tableName: "events",
    timestamps: true,
  });
  return Events;
}
