const express = require("express");
const {getAllUsers, getAUser, deleteAUser, updateAUser} = require('../Controllers/userController');
const router = express.Router();

router
    .route('/')
    .get(getAllUsers)






router
    .route('/:id')
    .get(getAUser)
    .patch(updateAUser)
    .delete(deleteAUser)
    

module.exports = router;