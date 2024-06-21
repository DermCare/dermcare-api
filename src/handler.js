const { Firestore } = require('@google-cloud/firestore')
const tf = require('@tensorflow/tfjs-node')
const crypto = require('crypto')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const db = new Firestore().collection('users')

const response = require("./response")
const loadModel = require('./loadModel')
const { getUser, storeUser, storeData, getHistories, editData, getMedicine } = require('./dataService')
const uploadImg = require('./uploadImage')
const diseaseClass = require('./diseaseClass')
const drugModel = require('./drugModel')

// const diseaseClassCopy = require('./additional/diseaseClass copy')

// async function inputHandler(req, res) {
//     const newFire = new Firestore()
//     const db = newFire.collection('medicines')

//     const array  = drugModel

//     array.forEach(data => {
//         db.doc(`${data.index}`).set(data)
//         console.log(data.index)
//     })
// }

async function deleteHisotryHandler(req, res) {
    const id = req.params.id
    const user = req.user
    const isDelete = await db.doc(user.id).collection('histories').doc(id).delete()
    if (!isDelete) {
        response(400, true, null, 'Gagal menghapus history', res)
    } else {
        response(200, false, null, 'History berhasil dihapus', res)
    }
}

async function medicineHandler(req, res) {
    const filter = req.query.type
    const medicines = await getMedicine()

    const medicine = medicines.filter((med) => med.drug_type.toLowerCase().match(filter))
        .map((med) => {
            return {
                name: med.drug_name,
                type: med.drug_type,
                desc: med.drug_desc,
                image: med.image_link
            }
        })
    response(200, false, medicine, 'Berhasil menampilkan obat', res)
}

function diseaseHandler(req, res) {
    const diseases = diseaseClass
    response(200, false, diseases, 'Berhasil menampilkan daftar penyakit', res)
}

function detailDiseaseHandler(req, res) {
    const id = req.params.id

    const disease = diseaseClass[id-1]
    response(200, false, disease, 'Berhasil menampilkan daftar penyakit', res)
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
    const confidenceScore = (Math.max(...score) * 100).toFixed(2)

    const classResult = tf.argMax(prediction, 1).dataSync()[0]
    const result = diseaseClass[classResult]
    const drug = drugModel[classResult]

    const id = crypto.randomUUID()
    const createdAt = new Date().toISOString()

    const data = {
        "id": id,
        "result": result.name,
        "desc": result.desc,
        "score": confidenceScore,
        "createdAt": createdAt,
        "image": `https://storage.googleapis.com/dermcare-model-bucket/${id}.jpg`,
        "drug": {
            "drug_img": drug.image_link,
            "drug_name": drug.drug_name,
            "desc": drug.drug_desc,
            "drug_type": drug.drug_type,
        }
    }

    await storeData(user.id, id, data)
    await uploadImg(req.file, id)

    if (!score) {
        res.status(400).send('There is a failure')
    } else {
        response(200, false, data, 'Berhasil prediksi gambar', res)
    }
}

async function getData(req, res) {
    const user = await getUser(req.user.id)
    const data = {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
        gender: user.gender,
        age: user.age,
        profile_pic: user.profile_pic
    }
    if (!user) {
        response(404, true, 'Users Not Found', 'Not Found', res)
    } else {
        response(200, false, data, 'Users Load Successfully', res)
    }
}

async function editHandler(req, res) {
    const user = req.user
    const { email, username, name, age, gender } = req.body

    const data = {
        email: email,
        username: username,
        name: name,
        age: age,
        gender: gender,
        profile_pic: `https://storage.googleapis.com/dermcare-model-bucket/${user.id}.jpg`,
    }
    console.log(req.file)
    await uploadImg(req.file, user.id)
    const check = await editData(user.id, data)

    if (!check) {
        res.status(400).send('There is a failure')
    } else {
        response(200, false, data, 'Berhasil merubah data', res)
    }

}

async function historiesHandler(req, res) {
    const histories = await getHistories(req.user.id)
    if (histories.length === 0) {
        response(204, false, 'There is no history', 'You do not have scanning histories', res)
    } else {
        response(200, false, histories, 'Histories Load Successfully', res)
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
    const { email, username, password } = req.body
    let age = gender = profile_pic = ' '
    let name = ' '

    const user = await db.where('email', '==', email).get()

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
        return response(400, true, null, 'Format email yang digunakan salah', res)
    }

    if (!username || !password) {
        return response(400, true, null, 'Username dan password tidak boleh kosong', res)
    }
    if (!user.empty) {
        return response(400, true, null, 'Akun atau email terkait sudah digunakan', res)
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
        name: name,
        username: username,
        password: hashPassword,
        gender: gender,
        age: age,
        profile_pic: profile_pic
    }

    await storeUser(id, data)
    return response(201, false, newUser, 'Berhasil melakukan register', res)
}

async function loginHandler(req, res) {
    const { email, password } = req.body
    const user = await db.where('email', '==', email).get()

    if (user.empty) {
        return response(404, true, null, 'Akun tidak terdaftar', res)
    }

    const userData = user.docs[0].data()
    const isValidate = await bcrypt.compare(password, userData.password)

    if (!isValidate) {
        return response(400, true, null, 'Autentikasi gagal', res)
    }

    const userAccess = {
        username: userData.username,
        id: userData.id
    }

    const token = jwt.sign(userAccess, process.env.ACCESS_TOKEN, { expiresIn: '30m' })
    const data = {
        email: userData.email,
        username: userData.username,
        token: token
    }
    return response(200, false, data, 'Berhasil login', res)
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
    medicineHandler,
    diseaseHandler,
    detailDiseaseHandler,
    deleteHisotryHandler,
    // inputHandler 
}