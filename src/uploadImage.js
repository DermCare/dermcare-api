const { Storage } = require('@google-cloud/storage')
const { format } = require('util')
const storage = new Storage()
const bucket = storage.bucket('dermcare-model-bucket')

async function uploadImg(file, id) {

    const { originalname, buffer } = file

    const blob = bucket.file(originalname.replace(originalname, `${id}.jpg`))
    const blobStream = blob.createWriteStream({
        resumable: false
    })
    blobStream.on('finish', () => {
        const publicUrl = format(
            `https://storage.googleapis.com/${bucket.name}/${blob.name}`
        )
        console.log(publicUrl)
    }).end(buffer)
}   
module.exports = uploadImg