// handle the relationship between Post and Tag
// Purely join table

module.exports = (sequelize, DataTypes) => {
    const PostTag = sequelize.define("PostTag", {
        postId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'posts', // refers to table name
                key: 'id'
            },
            onDelete: 'CASCADE',
        },
        tagId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'tags', // refers to table name
                key: 'id'
            },
            onDelete: 'CASCADE',
        },
    }, {
        tableName: 'post_tags',
        timestamps: false,
        // indexes: [
        //     {
        //         unique: true,
        //         fields: ['postId', 'tagId']  // Composite unique index
        //     },
        //     {
        //         fields: ['postId']  // Index for efficient querying
        //     },
        //     {
        //         fields: ['tagId']  // Index for efficient querying
        //     }
        // ]
    });

    return PostTag;
};