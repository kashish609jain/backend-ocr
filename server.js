const path = require('path');
const express = require('express');
const connectDB = require('./Backend/config/db')
const citizenRoutes = require('./Backend/routes/citizenRoutes')
const vision = require('@google-cloud/vision');
const multer = require('multer');
const dotenv = require('dotenv');
const cors = require('cors');
const { notFound, errorHandler } = require('./Backend/middleware/errorMiddleware');
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
    keyFilename:'Backend/api_key.json'
});
 
app.use(cors());
app.use(express.json());

// console.log(process.env.GOOGLE_APPLICATION_CREDENTIALS);

app.use('/api/citizen', citizenRoutes)

app.use(express.static(path.join(__dirname,"./frontend/build")))
app.get("*",function(req,res){
    res.sendFile(path.join(__dirname,"./client/build/index.html"));
})


app.post('/upload', upload.single('image'), async (req, res) => {
  try {
    const fileName = 'uploads/' + req.file.filename;
    const [result] = await client.textDetection(fileName);
    const detections = result.textAnnotations;
    const textResults = detections.map(text => text.description);

    const englishDateRegex = /\b\d{1,2} (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\. \d{4}\b/g;

    function extractEnglishDates(text) {
      return text.match(englishDateRegex) || [];
    }

    let allEnglishDates = [];

    textResults.forEach(result => {
      const englishDatesInResult = extractEnglishDates(result);
      allEnglishDates = allEnglishDates.concat(englishDatesInResult);
    });

    const joinedText = textResults.join(' ');

    const idNumberRegex = /\b\d+ \d+ \d+ \d+ \d+\b/g;
    const firstNameRegex = /\bName\s+([\s\S]+?)\n/;
    const lastNameRegex = /\bLast\s+name\s+(\S+)/;

    const idNumberMatch = joinedText.match(idNumberRegex);
    const firstNameMatch = joinedText.match(firstNameRegex);
    const lastNameMatch = joinedText.match(lastNameRegex);

    const idNumber = idNumberMatch ? idNumberMatch[0] : '';
    const firstName = firstNameMatch ? firstNameMatch[1] : '';
    const lastName = lastNameMatch ? lastNameMatch[1] : '';
    const dateOfBirth = allEnglishDates[0] || '';
    const issueDate = allEnglishDates[1] || '';
    const expiryDate = allEnglishDates[2] || '';

    function formatDate(dateString) {
      if (!dateString) return '';
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

    res.send(responseObject);
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
