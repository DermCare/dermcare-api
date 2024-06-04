const tf = require('@tensorflow/tfjs-node')

async function loadModel() {
    // return tf.loadGraphModel('file://models/model.json')
    return tf.loadGraphModel('file://model-baru/model.json')
}

module.exports = loadModel