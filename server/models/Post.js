module.exports = (sequelize, DataTypes) => {
    const Post = sequelize.define("Post", {
        title: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false
        }
    }, {
        tableName: 'posts'
    });
    return Post;
}