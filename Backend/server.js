const path = require('path');
const express = require('express');
const connectDB = require('./config/db')
const citizenRoutes = require('./routes/citizenRoutes')
const vision = require('@google-cloud/vision');
const multer = require('multer');
const dotenv = require('dotenv');
const cors = require('cors');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
dotenv.config();
connectDB()

const app = express();
const port = process.env.PORT || 5000;


// Multer setup
const storage = multer.diskStorage({
    destination(req, file, cb) {
      cb(null, "uploads/");
    },
    filename(req, file, cb) {
      cb(
        null,
        `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
      );
    },
  });

  function checkFileType(file, cb) {
    const filetypes = /jpg|jpeg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
  
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb("Images only!");
    }
  }
  
const upload = multer({ 
    storage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
 });


// Creates a client
const client = new vision.ImageAnnotatorClient({
    keyFilename:  'Backend/api_key.json',
});
 
app.use(cors());
app.use(express.json());

// console.log(process.env.GOOGLE_APPLICATION_CREDENTIALS);

app.use('/api/citizen', citizenRoutes)

app.use(express.static(path.join(__dirname,"./frontend/build")))
app.get("*",function(req,res){
    res.sendFile(path.join(__dirname,"./client/build/index.html"));
})



// Endpoint to perform text detection
app.post('/upload', upload.single('image'), async (req, res) => {
    try {

      const fileName = 'uploads/' + req.file.filename
      // console.log(fileName)
     // Performs text detection on the local file
      const [result] = await client.textDetection(fileName);
     // console.log(result)
      console.log("IN POST CALL")
      const detections = result.textAnnotations;
      const textResults = await detections.map(text => text.description);
      // console.log(textResults)

      // Join the array elements into a single string for easier processing
      const englishDateRegex = /\b\d{1,2} (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\. \d{4}\b/g;
      // Function to extract English dates from text using the regex
      function extractEnglishDates(text) 
      {
        return text.match(englishDateRegex) || [];
      }
      // Array to store all extracted English dates
      let allEnglishDates = [];
      // Loop through each text result and extract English dates
      textResults.forEach(result => {
      const englishDatesInResult = extractEnglishDates(result);
      allEnglishDates = allEnglishDates.concat(englishDatesInResult);
      });


      const joinedText = textResults.join(' ');

      // Regular expressions to extract information
      const idNumberRegex = /\b\d+ \d+ \d+ \d+ \d+\b/g;
      const firstNameRegex = /\bName\s+([\s\S]+?)\n/;
      const lastNameRegex = /\bLast\s+name\s+(\S+)/;

      // Extract information using regular expressions
      const idNumber = joinedText.match(idNumberRegex)[0];
      const firstName = joinedText.match(firstNameRegex)[1];
      const lastName = joinedText.match(lastNameRegex)[1];
      const dateOfBirth = allEnglishDates[0];
      const issueDate = allEnglishDates[1];
      
      const expiryDate = allEnglishDates[2];

      function formatDate(dateString) {
          const date = new Date(dateString);
          const day = date.getDate().toString().padStart(2, '0');
          const month = (date.getMonth() + 1).toString().padStart(2, '0');
          const year = date.getFullYear();
          return `${day}/${month}/${year}`;
      }

      const responseObject = {
          identification_number: idNumber,
          name: firstName,
          last_name: lastName,
          "date_of_birth": formatDate(dateOfBirth),
          "date_of_issue": formatDate(issueDate),
          "date_of_expiry": formatDate(expiryDate)
      };
      
      // Sending the JSON response
      res.send(responseObject);
      console.log(responseObject)
      console.log("image recieved")
      // res.json({ textResults });
    } catch (error) {
        console.error('Error during text detection:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Use the errorHandler middleware to handle errors
app.use(notFound);

// Use the errorHandler middleware to handle errors
app.use(errorHandler);
// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
