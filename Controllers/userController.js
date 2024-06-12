const User = require('../Models/userModel')
const catchAsync = require('../Controllers/utils/catchAsync');
const { equals } = require('validator');

exports.getAllUsers = catchAsync(async (req, res, next) => {
    const users = await User.find();

    res.status(200).json({
        status: 'success',
        message: "users successfully fetched",
        data: {
            users
        }
    })
})

exports.getAUser = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.body.id);

    res.status(200).json({
        status: "success",
        message: 'user fethced',
        data: {
            user
        }
    })
})

exports.updateAUser = catchAsync(async (req, res, next) => {
    const user = await User.findByIdAndUpdate(req.body.id);

    res.status(200).json({
        status: 'success',
        message: "updated",
        data: {
            user
        }
    })
})

exports.deleteAUser = catchAsync(async (req, res, next) => {
    const user = await User.findByIdAndDelete(req.body.id);

    res.status(200).json({
        status: "success",
        message: "successfully deleted",
        data: {
            user : null
        }
    })
})

exports.createAUser = catchAsync(async (req, res, next) => {
    const user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        confirmPassword : req.body.confirmPassword
    })
     
    res.status(200).json({
        status: "success",
        message: "User succesfully created",
        data: {
            user : user
        }
    })
})