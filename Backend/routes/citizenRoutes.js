const express = require('express')
const router = express.Router()
const { createCitizen, getCitizen, deleteCitizen } = require('../controllers/citizenController')


router.post('/', createCitizen)
router.get('/:id', getCitizen)
router.delete('/:id', deleteCitizen)


module.exports = router 