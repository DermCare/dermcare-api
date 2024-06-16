require('dotenv').config()
const express = require('express')
const app = express()
const port = 8080
const bodyParser = require('body-parser')
const multer = require('multer')

const upload = multer()
const { 
  getData, 
  predictHandler, 
  modelHandler, 
  registerHandler, 
  loginHandler, 
  verifyToken, 
  historiesHandler, 
  editHandler,
  medicineHandler,
  deleteHisotryHandler,
  diseaseHandler,
  detailDiseaseHandler, 
  // inputHandler
} = require('./src/handler')

app.use(bodyParser.json())

app.get('/api', modelHandler)
app.post('/register', registerHandler)
app.post('/login', loginHandler)
app.post('/predict', verifyToken, upload.single('image'), predictHandler)
app.get('/user', verifyToken, getData)
app.get('/user/histories', verifyToken, historiesHandler)
app.delete('/user/histories/:id', verifyToken, deleteHisotryHandler)

app.put('/user', verifyToken, upload.single('profile_pic'), editHandler)

app.get('/medicine', medicineHandler)
app.get('/diseases', diseaseHandler)
app.get('/diseases/:id', detailDiseaseHandler)

// app.post('/input', inputHandler)

app.listen(port, () => {
  console.log(`This API running on port ${port}`)
})