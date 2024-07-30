module.exports = (sequelize, DataTypes) => {
    const Post = sequelize.define("Post", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false,
            primaryKey: true,
        },
        title: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        postImage: {
            type: DataTypes.BLOB("long"),
            allowNull: true,
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        userId: {
            type: DataTypes.UUID,
            allowNull: false,
          },
    }, {
        tableName: 'posts',
        timestamps: true,
    });
    
    return Post;
}