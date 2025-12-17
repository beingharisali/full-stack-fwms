const mongoose = require('mongoose')

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.DB_URL)
        console.log('MONGODB IS CONNECTED')
    } catch (error) {
        console.log('mongodb connection error')
    }
    
}

module.exports = connectDB