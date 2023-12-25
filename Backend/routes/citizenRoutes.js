const express = require('express')
const router = express.Router()
const { createCitizen, getCitizen, deleteCitizen,editCitizen } = require('../controllers/citizenController')


router.post('/', createCitizen)
router.get('/:id', getCitizen)
router.delete('/:id', deleteCitizen)
router.put('/:id', editCitizen);

module.exports = router 