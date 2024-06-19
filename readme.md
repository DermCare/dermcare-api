## About Dermcare 
We want to handle the problem with the application we created called “DermCare” where this application can provide a classification of skin diseases according to the image inputted by the user and then will provide an accurate diagnosis and drug recommendations related to the disease experienced. Users can also directly purchase medicine in our application so that health, convenience, and comfort become the main points of our application. 

This API is providing data processing service that being use by the Mobile Application.

## How to Install
- git clone this repository
- npm install
- npm run dev

## Endpoint Documentation

### GET  /api
For checking the API is ready or not

### POST /register
For register new user account

### POST /login
For authentication using user account registered

### POST /predict
For upload image and scan uploaded image

### GET /user
For getting user information from authentication token

### GET /user/histories
For getting data of user's histories of scanning image 

### GET /medicine
For getting list of medicines

### GET /diseases
For getting list of diseases