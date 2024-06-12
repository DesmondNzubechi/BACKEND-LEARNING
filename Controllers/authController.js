const User = require('../Models/userModel');
const jwt = require("jsonwebtoken");
const catchAsync = require("../Controllers/utils/catchAsync");
const AppError = require("../Errors/appError")

const signToken = id => {
    return jwt.sign({ id: id }, process.env.JWT_SECRET, {
        expiresIn : process.env.JWT_EXPIRES_IN
    })
}


exports.signUpNewUser = catchAsync(async(req, res, next) => {

    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        confirmPassword : req.body.confirmPassword
    });

    const token = signToken(newUser._id)
    // const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
    //     expiresIn: process.env.JWT_EXPIRES_IN
    // });

    res.status(200).json({
        status: "success",
        message: "User successfully signed up",
        token,
        data: {
            newUser
        } 
    })

})

exports.loginUser = catchAsync(async (req, res, next) => {
    const { email, password } =  req.body;
    
    //1. check if email and password exist
    if (!email || !password) {
       return next( new AppError("Please input email", 400))
    }

    //2. check if user exist and the password is correct
    const user = await User.findOne({ email }).select("+password")
    // const correct = await user.correctPassword(password, user.password)

    if (!user || await user.correctPassword(password, user.password)) {
        return next(new AppError("Incorrect Email or password", 401))
    }

//3. if everything is okay, login
    const token = signToken(user._id)
    res.status(200).json({
        status: 'success',
        message: "successfully log in",
        token
    })
    
})