//USER CONTROLLER

const User = require('../Models/userModel')
const catchAsync = require('../Controllers/utils/catchAsync');
const AppError = require('../Errors/appError');


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

const filterObj = (obj, ...allowedField) => {
    Object.keys(obj).forEach(el => {
        if (allowedField.includes(el)) newObj[el] = obj[el]
    });
    return newObj
}

exports.updateMe = catchAsync(async (req, res, next) => {
     
    const { id, name, email, password, confirmPassword } = req.body;

    if (password || confirmPassword) {
        return next(new AppError("This is not route for updating password", 400))
    }

    //2) filter user
    const filterdBody = filterObj(req.body, "name", "email")

    //3) update user
    const updatedUser = User.findByIdAndUpdate( id, filterdBody, {
        new: true,
        runValidators: true
        } ); 
       
    res.status(200).json({
        status: "success",
        data: {
            user : updatedUser
        }
    })
})
    

exports.deleteMe = catchAsync(async(req, res, next) => {
    //const { id, email } = req.body;

    await User.findByIdAndUpdate(req.user.id, { active: false })
    
    res.status(204).json({
        status: 'success',
        data : null
    })
})



