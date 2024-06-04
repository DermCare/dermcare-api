const  { Firestore } = require('@google-cloud/firestore')
const db = new Firestore().collection('users')

async function storeUser(id, data) {
    return db.doc(id).set(data)
} 

async function storeData(user_id, id, data) {
    return db.doc(user_id).collection('histories').doc(id).set(data)
}

async function getUser(username) {
    const user = db.where('username', '==', username)
    const snapshot = await user.get()
    return snapshot.docs.map(doc => doc.data())

}

async function getHistories(user_id) {
    const userData = db.doc(user_id).collection('histories')
    const snapshot = await userData.get()
    return snapshot.docs.map(doc => doc.data())
}

async function editData(user_id, data) {
    const user = db.doc(user_id)
    const response = await user.update(data)
    if (!response) {
        console.log('Gagal')
    }else {
        return response
        console.log('Berhasil')
    }
}

module.exports = { storeUser, storeData, getUser, getHistories, editData }