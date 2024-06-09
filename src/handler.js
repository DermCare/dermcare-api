const { Firestore } = require('@google-cloud/firestore')
const tf = require('@tensorflow/tfjs-node')
const crypto = require('crypto')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const db = new Firestore().collection('users')

const response = require("./response")
const loadModel = require('./loadModel')
const { getUser, storeUser, storeData, getHistories, editData} = require('./dataService')
const uploadImg = require('./uploadImage')
const diseaseClass = require('./diseaseClass')
const drugModel = require('./drugModel')

// const diseaseClassCopy = require('./additional/diseaseClass copy')

// async function inputHandler(req, res) {
//     const newFire = new Firestore()
//     const db = newFire.collection('diseases')
    
//     const array  = diseaseClassCopy

//     array.forEach(data => {
//         db.doc(`${data.id}`).set(data)
//         console.log(data.id)
//     })
// }

function medicineHandler(req, res) {
    response(200, 'success', drugModel, 'Berhasil menampilkan obat', res)
}

async function predictHandler(req, res) {
    const user = req.user
    const image = req.file.buffer
    const model = await loadModel()
    const tensor = tf.node
        .decodeJpeg(image)
        .resizeNearestNeighbor([256, 256])
        .expandDims()
        .toFloat()

    const prediction = model.predict(tensor)
    const score = await prediction.data()
    const confidenceScore = Math.max(...score) * 100

    const classResult = tf.argMax(prediction, 1).dataSync()[0]
    // const result = await getDisease(classResult+1)
    const result = diseaseClass[classResult]
    const drug = drugModel[classResult]

    const id = crypto.randomUUID()
    const createdAt = new Date().toISOString()
    
    const data = {
        "id": id,
        "result": result,
        "score": confidenceScore,
        "createdAt": createdAt,
        "image": `https://storage.googleapis.com/dermcare-model-bucket/${id}.jpg`,
        "drug": { 
            "drug_img": drug.Image_link,
            "drug_name": drug.Drug_Name,
            "desc": drug.Description
        }
    }

    await storeData(user.id, id, data)
    await uploadImg(req.file, id)

    if (!score) {
        res.status(400).send('There is a failure')
    } else {
        response(200, 'success',  data, 'Berhasil prediksi gambar', res)
    }
}

async function getData(req, res) {
    const user = await getUser(req.user.id)
    if (!user) {
        response(404, 'fail', 'Users Not Found', 'Not Found', res)
    } else {
        response(200, 'success', user, 'Users Load Successfully', res)
    }
}

async function editHandler(req, res) {
    const user = req.user
    const { email, username, age, gender } = req.body

    const data = { 
        email: email, 
        username: username, 
        age: age,
        gender: gender
    }

    const check = await editData(user.id, data)

    if (!check) {
        res.status(400).send('There is a failure')
    } else {
        response(200, 'success',  data, 'Berhasil merubah data', res)
    }

}

async function historiesHandler(req,res) {
    const histories = await getHistories(req.user.id)
    if (histories.length === 0) {
        response(204, 'success', 'There is no history', 'You do not have scanning histories', res)
    } else {
        response(200, 'success', histories, 'Histories Load Successfully', res)
    }
}

async function modelHandler(req, res) {
    const model = await loadModel()
    if (!model) {
        res.status(400).send('API is not ready')
    } else {
        res.status(200).send('API is ready')
    }
}

async function registerHandler(req, res) {
    const { email, username, password} = req.body
    let age = gender = ' '

    const user = await db.where('username', '==', username).get()

    if (!username || !password) {
        return response(400, 'fail', '', 'Username dan password tidak boleh kosong', res)
    } 
    if (!user.empty) {
        return response(400, 'fail', '', 'Akun atau email terkait sudah digunakan', res)
    }

    const hashPassword = await bcrypt.hash(password, 10)
    const id = crypto.randomUUID()

    const newUser = {
        email: email,
        username: username,
    }

    const data = {
        id: id,
        email: email,
        username: username,
        password: hashPassword,
        gender: gender, 
        age: age,
    }

    await storeUser(id, data)
    return response(201, 'success', newUser, 'Berhasil melakukan register', res)
}

async function loginHandler(req, res) {
    const { email, password } = req.body
    const user = await db.where('email', '==', email).get()

    if (user.empty) {
        return response(404, '', 'Akun tidak terdaftar', res)
    }

    const userData = user.docs[0].data()
    const isValidate = await bcrypt.compare(password, userData.password)

    if (!isValidate) {
        return response(400, 'fail', '', 'Autentikasi gagal', res)
    }

    const userAccess = {
        username: userData.username,
        id: userData.id
    }

    const token = jwt.sign(userAccess, process.env.ACCESS_TOKEN, { expiresIn: '5m' })
    const data = { 
        email: userData.email,
        username: userData.username,
        token: token
    }
    return response(200, 'success', data, 'Berhasil login', res)
}

function verifyToken(req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if (token == null) return res.sendStatus(401)

    jwt.verify(token, process.env.ACCESS_TOKEN, (err, user) => {
        if (err) return res.sendStatus(403)
        req.user = user
        next()
    })
}

module.exports = { 
    predictHandler, 
    getData, 
    modelHandler, 
    registerHandler, 
    loginHandler, 
    verifyToken, 
    historiesHandler, 
    editHandler, 
    medicineHandler
    // inputHandler 
}