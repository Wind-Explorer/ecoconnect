module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      id: {
        type: DataTypes.STRING(36),
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
      },
      phoneNumber: {
        type: DataTypes.STRING(8),
        allowNull: false,
      },
      password: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      isArchived: {
        type: DataTypes.BOOLEAN(),
        allowNull: false,
      },
    },
    {
      tableName: "users",
    }
  );
  return User;
};
