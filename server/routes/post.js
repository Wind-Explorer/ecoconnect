const express = require('express');
const router = express.Router();
const { Post, User } = require('../models');
const { Op, where } = require("sequelize");
const yup = require("yup");
const multer = require("multer");
const sharp = require("sharp");

// Profanity function
const Filter = require('bad-words');  // Import the bad-words library
const filter = new Filter();

var newBadWords = ['bloody', 'bitch', 'fucker', 'fuck', 'fk', 'shit', 'bastard', 'dumbass', 'stupid', 'hell'];
filter.addWords(...newBadWords);

let removeWords = [''];
filter.removeWords(...removeWords);

router.post("/", async (req, res) => {
    let data = req.body;
    // Validate request body
    let validationSchema = yup.object({
        title: yup.string().trim().min(3).max(200).required(), // yup object to define validation schema
        content: yup.string().trim().min(3).max(500).required(),
        postImage: yup.string().trim().max(255),
    });
    try {
        data = await validationSchema.validate(data, // validate() method is used to validate data against the schema and returns the valid data and any applied transformations
            { abortEarly: false }); // abortEarly: false means the validation won’t stop when the first error is detected
        // Process valid data
        
        // Check for profanity
        if (filter.isProfane(data.title)) {
            return res.status(400).json({ field: 'title', error: 'Profane content detected in title' });
        }
        if (filter.isProfane(data.content)) {
            return res.status(400).json({ field: 'content', error: 'Profane content detected in content' });
        }

        let result = await Post.create(data); //  sequelize method create() is used to insert data into the database table
        res.json(result);
    }
    catch (err) {
        res.status(400).json({ errors: err.errors }); // If the error is caught, return the bad request
    }
});


// // sequelize method findAll is used to generate a standard SELECT query which will retrieve all entries from the table
// router.get("/", async (req, res) => {
//     let list = await Tutorial.findAll({
//     // order option takes an array of items. These items are themselves in the form of [column, direction]
//     order: [['createdAt', 'DESC']]
//     });
//     res.json(list);
// });

router.get("/", async (req, res) => {
    let condition = {
        order: [['createdAt', 'DESC']]
    };

    let search = req.query.search;
    if (search) {
        condition[Op.or] = [
            { title: { [Op.like]: `%${search}%` } },
            { content: { [Op.like]: `%${search}%` } }
        ];
    }
    // You can add condition for other columns here
    // e.g. condition.columnName = value;

    let list = await Post.findAll(condition);
    res.json(list);
});

router.get("/:id", async (req, res) => {
    let id = req.params.id;
    let post = await Post.findByPk(id);
    // Check id not found
    if (!post) {
        res.sendStatus(404); // If the tutorial is null, return error code 404 for Not Found
        return;
    }
    res.json(post);
});

router.put("/:id", async (req, res) => {
    let id = req.params.id;
    // Check id not found
    let post = await Post.findByPk(id);
    if (!post) {
        res.sendStatus(404);
        return;
    }
    let data = req.body;
    // Validate request body
    let validationSchema = yup.object({
        title: yup.string().trim().min(3).max(100),
        content: yup.string().trim().min(3).max(500)
    });
    try {
        data = await validationSchema.validate(data,
            { abortEarly: false });

        // Check for profanity
        if (filter.isProfane(data.title)) {
            return res.status(400).json({ field: 'title', error: 'Profane content detected in title' });
        }
        if (filter.isProfane(data.content)) {
            return res.status(400).json({ field: 'content', error: 'Profane content detected in content' });
        }

        // Process valid data
        let post = await Post.update(data, { // update() updates data based on the where condition, and returns the number of rows affected
            where: { id: id } // If num equals 1, return OK, otherwise return Bad Request
        });
        if (post == 1) {
            res.json({
                message: "Post was updated successfully."
            });
        }
        else {
            res.status(400).json({
                message: `Cannot update post with id ${id}.`
            });
        }
    }
    catch (err) {
        res.status(400).json({ errors: err.errors });
    }
});

router.delete("/:id", async (req, res) => {
    let id = req.params.id;
    // Check id not found
    let post = await Post.findByPk(id);
    if (!post) {
        res.sendStatus(404);
        return;
    }
    let num = await Post.destroy({ // destroy() deletes data based on the where condition, and returns the number of rows affected
        where: { id: id }
    })
    if (num == 1) { // destry() returns no. of rows affected, that's why if num == 1
        res.json({
            message: "Post was deleted successfully."
        });
    }
    else {
        res.status(400).json({
            message: `Cannot delete post with id ${id}.`
        });
    }
});

module.exports = router;