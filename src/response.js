const response = (statusCode, error, data, message, res) => {
    res.status(statusCode).json({
        error: error,
        message,
        payload: data,
    })
}

module.exports = response