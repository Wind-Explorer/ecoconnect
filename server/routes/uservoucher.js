const express = require('express');
const router = express.Router();
const { UserVoucher } = require("../models");
const { Op } = require('sequelize');
const yup = require('yup');

router.get("/:id", async (req, res) => {
    let id = req.params.id;
    let vouchers = await UserVoucher.findByPk(id);
    if (!vouchers) {
        res.sendStatus(404);
        return;
    }
    res.json(vouchers);
});

router.post('/', async (req, res) => {
    const { userId, voucherId } = req.body;

    if (!userId || !voucherId) {
        return res.status(400).json({ error: 'userId and voucherId are required' });
    }

    try {
        const userVoucher = await UserVoucher.create({ userId, voucherId });
        res.status(201).json(userVoucher);
    } catch (error) {
        res.status(500).json({ error: "Failed to create UserVoucher entry" });
    }
});

router.get('/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        // Fetch user vouchers by userId
        const userVouchers = await UserVoucher.findAll({ where: { userId } });

        if (!userVouchers) {
            return res.status(404).json({ error: 'No vouchers found for this user' });
        }

        // Extract voucherIds from the userVouchers
        const voucherIds = userVouchers.map(userVoucher => userVoucher.voucherId);

        // Send the voucherIds along with userVoucher information
        res.json({ userVouchers, voucherIds });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch user vouchers' });
    }
});


module.exports = router;
