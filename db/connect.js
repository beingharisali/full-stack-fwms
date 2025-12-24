const mongoose = require('mongoose')

const connectDB = async (uri) => {
    try {
        await mongoose.connect(uri)
        console.log('MONGODB IS CONNECTED')
    } catch (error) {
        console.log('mongodb connection error:', error.message)
    }
}

module.exports = connectDB
