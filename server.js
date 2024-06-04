require('dotenv').config()
const express = require('express')
const app = express()
const port = 5000
const bodyParser = require('body-parser')
const multer = require('multer')

const upload = multer()
const { getData, predictHandler, modelHandler, registerHandler, loginHandler, verifyToken, historiesHandler, editHandler} = require('./src/handler')

app.use(bodyParser.json())

app.get('/api', modelHandler)
app.post('/register', registerHandler)
app.post('/login', loginHandler)
app.post('/predict', verifyToken,upload.single('image'), predictHandler)
app.get('/user', verifyToken, getData)
app.get('/user/histories', verifyToken, historiesHandler)

app.put('/user/edit', verifyToken, editHandler)

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})