module.exports = (sequelize, DataTypes) => {
    const Comment = sequelize.define("Comment", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false,
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        parentId: {
            type: DataTypes.UUID,
            allowNull: true,
          },
    }, {
        tableName: 'comments',
        timestamps: true,
    });

    Comment.associate = (models) => {
        Comment.belongsTo(models.User, {
          foreignKey: 'userId',
          as: "user",
          onDelete: 'CASCADE',
        });
        Comment.belongsTo(models.Post, {
          foreignKey: 'postId',
          as: "post",
          onDelete: 'CASCADE',
        });
        Comment.hasMany(models.Comment, {
          foreignKey: 'parentId',
          as: 'replies',
        });
      };

    return Comment;
}