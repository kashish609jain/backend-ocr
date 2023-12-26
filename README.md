# I have made ocr using google vision api 
## Tech stack - Mongodb ExpressJs ReactJs Nodejs 
## To run backend file use
- npm install
- npm run server

## features 
- you can upload thai card image and fetch data from it using google vision api
- save the data in mongoDB
- There is one button to check all history
- In history one can perform search edit and delete function

## Test Case / Error Handling 
- Only data in the form of jpeg, png, jpg format is allowed
- Size should be less than 2MB
- I suppose image is not of thai card then no result will will displayed feild will be empty and user can't save this data
- Suppose if data is not present in some feild but present in some other feild then also user can save the data
- user can only save data when data is completely fetched from ocr and field is complete
- if same image is being uploaded and saved numerous time then also one time data will be saved in data base






