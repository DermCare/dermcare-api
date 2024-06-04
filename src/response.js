const response = (statusCode, status, data, message, res) => {
    res.status(statusCode).json({
        status: status,
        message,
        payload: data,
    })
}

module.exports = response