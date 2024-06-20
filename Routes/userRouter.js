const express = require("express");
const { getAllUsers, updateMe, getAUser, deleteAUser, updateAUser, createAUser } = require('../Controllers/userController');
const {signUpNewUser, loginUser, protectedRoute, restrictTo, forgotPassword, resetPassword, updatePassword} = require("../Controllers/authController")
const router = express.Router();


router.post("/signup", signUpNewUser)
router.post("/login", loginUser)

router.post("/forgotPassword", forgotPassword)
router.patch("/resetPassword/:token", resetPassword)
router.patch("/updateMyPassword", updatePassword)
router.patch("/updateMe", protectedRoute, updateMe);

router
    .route('/')
    .get(protectedRoute, getAllUsers)
    .post(createAUser)


   

router
    .route('/:id')
    .get(getAUser)
    .patch(updateAUser)
    .delete(protectedRoute, restrictTo('admin', 'moderator'), deleteAUser)
    

module.exports = router;