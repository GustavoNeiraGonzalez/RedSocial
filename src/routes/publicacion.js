const express = require('express');
const router = express.Router();

const publicacionController = require('../controllers/publicacionController');

router.post('/add', publicacionController.save);
router.get('/delete/:id', publicacionController.delete);
router.post('/update/:id', publicacionController.update);

module.exports=router;