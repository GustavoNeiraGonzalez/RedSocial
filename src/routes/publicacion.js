const express = require('express');
const router = express.Router();

const publicacionController = require('../controllers/publicacionController');

router.get('/', publicacionController.list);
router.post('/add', publicacionController.save);

module.exports=router;