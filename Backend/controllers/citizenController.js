const asyncHandler = require('express-async-handler')
const Citizen = require('../models/citizenModel')


const createCitizen = asyncHandler(async(req, res) => {
    
    const citizenExists = await Citizen.findOne({identification_number: req.body.idNumber})
    const {idNumber, name, last_name, date_of_birth, date_of_issue, date_of_expiry} = req.body

    if(citizenExists)
    {
        citizenExists.name = name || citizenExists.name
        citizenExists.last_name = last_name || citizenExists.last_name
        citizenExists.date_of_birth = date_of_birth || citizenExists.date_of_birth
        citizenExists.date_of_issue = date_of_issue || citizenExists.date_of_issue
        citizenExists.date_of_expiry = date_of_expiry || citizenExists.date_of_expiry
        await citizenExists.save()
    } 
    else 
    {
        const citizen = await Citizen.create({
            identification_number: idNumber, 
            name, 
            last_name, 
            date_of_birth, 
            date_of_issue,  
            date_of_expiry
        })

        try{
            res.status(201).json(citizen)
        } catch (error) {
            res.status(400)
            throw new Error('Unable to Save') 
        }
    }

    try{
        res.status(201).json(citizenExists)
    } catch (error) {
        res.status(400)
        throw new Error('Unable to Save')
    }
})

// const getCitizen = async(req, res) => {
//     // console.log("IN GET CALL", req)
//     const id = req.params.id;
//     // if id is not received dont call the mongo find 
//     var citizen = null
//     if (id){
//         citizen = await Citizen.findOne({identification_number: id})
//     }
//     else{
//         res.status(404)
//         throw new Error('Citizen not found')    
//     }
//     if(citizen){
//         res.json(citizen)
//     } else{
//         res.status(404)
//         throw new Error('Citizen not found')
//     }
  
// }

const getCitizen = async (req, res) => {
    try {
        const id = req.params.id;
        if (!id) {
            res.status(404);
            throw new Error('Citizen ID not provided');
        }
        const citizen = await Citizen.findOne({ identification_number: id });
        if (citizen) {
            res.json(citizen);
        } else {
            
            res.status(404);
            throw new Error('Citizen not found');
        }
    } catch (error) {
        
        res.status(500).json({ error: error.message });
    }
};

// Assuming you have error handling middleware set up, the error will be caught and handled appropriately.


// const deleteCitizen = async(req, res) => {
//     // upar bhi sahi kr lena it should be id number and not id since db ki id nahi hai woh 
//     // url me bhi it should be id number not id 
//     console.log('IN DELETE CALL')
//     // console.log(req.body)
//     console.log(req.params)
//     id_number = req.params.id
//     var citizen = await Citizen.findOne({identification_number: id_number})
//     // also use a try catch here if the mongo gives some error it will not break the code 
//     if(citizen) {
//         console.log("CITIZEN",citizen)
//         // await citizen.remove()
//         await Citizen.findByIdAndDelete(citizen.id)
//         res.json({message: 'Citizen removed'})
//     } else {
//         res.status(404)
//         throw new Error('Citizen not found')
//     }
// }

const deleteCitizen = async (req, res) => {
    try {
        // console.log('IN DELETE CALL');
        // console.log(req.params);
        const id_number = req.params.id;
        // Use a try-catch block for MongoDB operations
        try{
            const citizen = await Citizen.findOne({ identification_number: id_number });

            if (citizen) {
                await Citizen.findByIdAndDelete(citizen.id);
                res.json({ message: 'Citizen removed' });
            } else {
                res.status(404);
                throw new Error('Citizen not found');
            }
        } 
        catch (mongoError) 
        {
            // Handle MongoDB errors
            console.error('MongoDB Error:', mongoError);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    } catch (error) {
        // Handle any other errors
        res.status(500).json({ error: error.message });
    }
};


module.exports = {createCitizen, getCitizen, deleteCitizen}

