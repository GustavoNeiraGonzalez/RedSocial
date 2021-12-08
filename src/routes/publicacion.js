const express = require('express');
const router = express.Router();

const publicacionController = require('../controllers/publicacionController');

router.get('/', publicacionController.list);

module.exports=router;