const mongoose = require('mongoose')

const citizenSchema = mongoose.Schema({
    identification_number: {
        type: String,
        unique: true,
        required: true,
    },
    name: {
        type: String,
        required: true
    },
    last_name: {
        type: String,
        required: true
    },
    date_of_birth: {
        type: String,
        required: true
    },
    date_of_issue: {
        type: String,
        required: true
    },
    date_of_expiry: {
        type: String,
        required: true
    }
})

const Citizen = mongoose.model('Citizen', citizenSchema)

module.exports = Citizen