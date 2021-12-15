const express = require('express');
const router = express.Router();

const publicacionController = require('../controllers/publicacionController');

router.get('/', publicacionController.list);
router.post('/add', publicacionController.save);
router.get('/delete/:id', publicacionController.delete);
router.get('/update/:id', publicacionController.edit);
router.post('/update/:id', publicacionController.update);

module.exports=router;