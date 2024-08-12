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
        },
    }, {
        tableName: 'tags',
        timestamps: false,
        // indexes: [
        //     {
        //         unique: true,
        //         fields: ['tag'],  // Unique index on the tag column
        //         name: 'unique_tag_index',  // Explicitly naming the index
        //     }
        // ]
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