const express = require('express');
const router = express.Router();
const { Schedule } = require('../models');
const { Op } = require("sequelize");
const yup = require("yup");

router.post("/", async (req, res) => {
    let data = req.body;
    // Validate request body
    let validationSchema = yup.object().shape({
        dateTime: yup.date().required(),
        location: yup.string().trim().min(15).max(50).required(),
        postalCode: yup.string().matches(/^\d{6}$/, 'Postal code must be exactly 6 digits').required(),
        status: yup.string().trim().required()
    });
    try {
        data = await validationSchema.validate(data, { abortEarly: false });
        // Process valid data
        let result = await Schedule.create(data);
        res.json(result);
    } catch (err) {
        res.status(400).json({ errors: err.errors });
    }
});

router.get("/", async (req, res) => {
    let condition = {};
    let search = req.query.search;
    if (search) {
        condition[Op.or] = [
            { dateTime: { [Op.like]: `%${search}%` } },
            { location: { [Op.like]: `%${search}%` } },
            { postalCode: { [Op.like]: `%${search}%` } },
            { status: { [Op.like]: `%${search}%` } }
        ];
    }
    let list = await Schedule.findAll({
        where: condition,
        order: [['createdAt', 'ASC']]
    });
    res.json(list);
});

router.get("/:id", async (req, res) => {
    let id = req.params.id;
    let schedule = await Schedule.findByPk(id);
    if (!schedule) {
        res.sendStatus(404);
        return;
    }
    res.json(schedule);
});

router.put("/:id", async (req, res) => { //update
    let id = req.params.id;
    let schedule = await Schedule.findByPk(id);
    if (!schedule) {
        res.sendStatus(404);
        return;
    }
    let data = req.body;
    let validationSchema = yup.object().shape({
        dateTime: yup.date().required(),
        location: yup.string().trim().min(15).max(50).required(),
        postalCode: yup.string().matches(/^\d{6}$/, 'Postal code must be exactly 6 digits').required(),
        status: yup.string().trim().required()
    });
    try {
        data = await validationSchema.validate(data,
            { abortEarly: false });
        let num = await Schedule.update(data, {
            where: { id: id }
        });
        if (num == 1) {
            res.json({
                message: "Schedule was updated successfully."
            });
        }
        else {
            res.status(400).json({
                message: `Cannot update schedule with id ${id}.`
            });
        }
    }
    catch (err) {
        res.status(400).json({ errors: err.errors });
    }
});

router.delete("/:id", async (req, res) => {
    let id = req.params.id;
    let num = await Schedule.destroy({
        where: { id: id }
    })
    if (num == 1) {
        res.json({
            message: "Schedule was deleted successfully."
        });
    }
    else {
        res.status(400).json({
            message: `Cannot delete schedule with id ${id}.`
        });
    }
});


module.exports = router;