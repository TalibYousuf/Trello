const express = require('express');
const router = express.Router();
const { getBoard, moveCard, createCard, deleteCard, updateListColor, seedBoard, deleteCardBody, updateListColorBody } = require('../controllers/boardController');

router.get('/', getBoard);
router.post('/move', moveCard);
router.post('/card', createCard);
router.delete('/card/:id', deleteCard);
router.post('/card/:id/delete', deleteCard);
router.post('/delete-card', deleteCardBody);
router.post('/card/delete', deleteCardBody);
router.put('/list/:id/color', updateListColor);
router.post('/list/:id/color', updateListColor);
router.post('/update-list-color', updateListColorBody);
router.post('/list/color', updateListColorBody);
router.post('/seed', seedBoard);

module.exports = router;