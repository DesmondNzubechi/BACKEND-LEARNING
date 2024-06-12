const express = require("express");
const { getAllUsers, getAUser, deleteAUser, updateAUser, createAUser } = require('../Controllers/userController');
const {signUpNewUser, loginUser} = require("../Controllers/authController")
const router = express.Router();


router.post("/signup", signUpNewUser)
router.post("/login", loginUser)

router
    .route('/')
    .get(getAllUsers)
    .post(createAUser)


  

router
    .route('/:id')
    .get(getAUser)
    .patch(updateAUser)
    .delete(deleteAUser)
    

module.exports = router;