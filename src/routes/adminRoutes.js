const express = require('express');
const router = express.Router();
const { getUsers, activateUser, deactivateUser, createUser } = require('../controllers/adminController');
const { protect, admin } = require('../middlewares/authMiddleware');

router.use(protect);
router.use(admin);

router.get('/users', getUsers);
router.post('/users', createUser);
router.patch('/users/:id/activate', activateUser);
router.patch('/users/:id/deactivate', deactivateUser);

module.exports = router;
