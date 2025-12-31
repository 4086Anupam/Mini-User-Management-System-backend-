const express = require('express');
const router = express.Router();
const { getUserProfile, updateUserProfile, changePassword } = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');

router.use(protect);

router.get('/profile', getUserProfile);
router.put('/profile', updateUserProfile);
router.put('/change-password', changePassword);

module.exports = router;
