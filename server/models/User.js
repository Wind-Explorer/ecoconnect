const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const User = sequelize.define(
    "User",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      firstName: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      lastName: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(69),
        allowNull: false,
        validate: {
          isEmail: true,
        },
      },
      phoneNumber: {
        type: DataTypes.STRING(8),
        allowNull: false,
        validate: {
          len: [8, 8],
        },
      },
      password: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      profilePicture: {
        type: DataTypes.BLOB("long"),
        allowNull: true,
      },
      accountType: {
        type: DataTypes.TINYINT(2),
        allowNull: false,
        defaultValue: 0
      },
      isArchived: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      tableName: "users",
      timestamps: true,
    }
  );

  return User;
};
