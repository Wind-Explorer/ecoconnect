module.exports = (sequelize, DataTypes) => {
    const Tag = sequelize.define("Tag", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false,
            primaryKey: true,
        },
        tag: {
            type: DataTypes.STRING(30),
            allowNull: false,
            unique: true,  // Ensure tags are unique
        },
    }, {
        tableName: 'tags',
        timestamps: false,
    });

    Tag.associate = (models) => {
        Tag.belongsToMany(models.Post, {
            through: models.PostTag,
            foreignKey: 'tagId',
            otherKey: 'postId',
        });
    };

    return Tag;
};