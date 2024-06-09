const  { Firestore } = require('@google-cloud/firestore')
const db = new Firestore()
const users = db.collection('users')
const medicines = db.collection('medicines')
const diseases = db.collection('diseases')

async function storeUser(id, data) {
    return users.doc(id).set(data)
} 

async function storeData(user_id, id, data) {
    return users.doc(user_id).collection('histories').doc(id).set(data)
}

async function getUser(id) {
    // const user = users.where('username', '==', username)
    const user = users.doc(id)
    const snapshot = await user.get()
    return snapshot.data()
}

function getMedicine() {
    
}

async function getDisease(id) {
    const disease = diseases.where('id', '==', id)
    const snapshot = await disease.get()
    return snapshot.docs.map(doc => doc.data()) 
}

async function getHistories(user_id) {
    const userData = users.doc(user_id).collection('histories')
    const snapshot = await userData.get()
    return snapshot.docs.map(doc => doc.data())
}

async function editData(user_id, data) {
    const user = users.doc(user_id)
    const response = await user.update(data)
    if (!response) {
        console.log('Gagal')
    }else {
        return response
        console.log('Berhasil')
    }
}

module.exports = { storeUser, storeData, getUser, getHistories, editData, getDisease}