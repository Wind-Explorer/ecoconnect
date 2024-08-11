const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Feedback = sequelize.define(
    "Feedback",
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
      feedbackCategory: {
        type: DataTypes.TINYINT(2),
        allowNull: false,
      },
      allowContact: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      subject: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      comment: {
        type: DataTypes.STRING(1024),
        allowNull: false,
      },
    },
    {
      tableName: "feedbacks",
      timestamps: true,
    }
  );

  return Feedback;
};
