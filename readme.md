## About Dermcare 
We want to handle the problem with the application we created called “DermCare” where this application can provide a classification of skin diseases according to the image inputted by the user and then will provide an accurate diagnosis and drug recommendations related to the disease experienced. 

This API is providing data processing service that being use by the Mobile Application.

## Prerequisites
- Node JS Installed
- Code Editor (Visual Studio Code, Sublime Text, or Atom)

## How to Install
1. Clone this repository
```bash
   git clone https://github.com/DermCare/dermcare-api.git
   ```
2. Install package manager
```bash
   npm install
   ```
3. Run the development server
```bash
   npm run dev
   ```

## Endpoint Documentation

### GET  /api
- For checking the API is ready or not

### POST /register
- For register new user account

### POST /login
- For authentication using user account registered

### POST /predict
- For upload image and scan uploaded image

### GET /user
- For getting user information from authentication token

### GET /user/histories
- For getting data of user's histories of scanning image 

### GET /medicine
- For getting list of medicines

### GET /diseases
- For getting list of diseases