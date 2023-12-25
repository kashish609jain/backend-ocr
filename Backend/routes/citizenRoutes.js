const express = require('express')
const router = express.Router()
const { createCitizen, getCitizen, deleteCitizen,editCitizen,getAllCitizens } = require('../controllers/citizenController')


router.post('/', createCitizen)
router.get('/:id', getCitizen)
router.delete('/:id', deleteCitizen)
router.put('/:id', editCitizen);
router.get('/', getAllCitizens);

module.exports = router 