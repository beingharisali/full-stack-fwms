const express = require('express')
const router = express.Router()
const {
    getAllUsers,
    getUser,
    updateUser,
    deleteUser,
    register,
    login
} = require('../controllers/user')

router.post('/register', register)
router.post('/login', login)
router.route('/').get(getAllUsers)
router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser)

module.exports = router