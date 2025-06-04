const express = require('express');
const router = express.Router();

const authRoutes = require('./auth');
const aiRoutes = require('./ai');
const adminRoutes = require('./admin');
const userRoutes = require('./user');

// All routes
router.use('/', authRoutes);
router.use('/', aiRoutes);
router.use('/', adminRoutes);
router.use('/', userRoutes);

module.exports = router;
