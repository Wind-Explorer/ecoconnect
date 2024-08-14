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
      townCouncil: {
        type: DataTypes.STRING(30),
        allowNull: false,
      },
      accountType: {
        type: DataTypes.TINYINT(2),
        allowNull: false,
        defaultValue: 0,
      },
      isArchived: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      resetPasswordToken: {
        type: DataTypes.STRING(64),
        allowNull: true,
      },
      resetPasswordExpireTime: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      secret: {
        type: DataTypes.STRING(64),
        allowNull: true,
      },
    },
    {
      tableName: "users",
      timestamps: true,
    }
  );

  return User;
};
