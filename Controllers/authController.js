const {promisify} = require('util')
const User = require('../Models/userModel');
const jwt = require("jsonwebtoken");
const catchAsync = require("../Controllers/utils/catchAsync");
const AppError = require("../Errors/appError")
const sendEmail = require('./utils/email');
const crypto = require("crypto")

const signToken = id => {
    return jwt.sign({ id: id }, process.env.JWT_SECRET, {
        expiresIn : process.env.JWT_EXPIRES_IN
    })
}



const createAndSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);


    
    const { NODE_ENV, JWT_COOKIE_EXPIRES_IN } = process.env;


    const cookieOptions = {
        expires: new Date(Date.now() + JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
        httpOnly: true,
    }

    if (process.env.NODE_ENV === "production") cookieOptions.secure = true;

    res.cookie("jwt", token, cookieOptions)




    user.password = undefined;

    res.status(statusCode).json({
        status: "success",
        token, 
        data: {
            user
        }
    })
}


exports.signUpNewUser = catchAsync(async (req, res, next) => {

    const { email, name, password, confirmPassword } = req.body
    
    const userExist = await User.findOne({ email })
    
    if (userExist) {
       return res.status(400).json({
            status: "Fail",
            message: "Email already exist"
        })
    }

    const newUser = await User.create({
        name,
        email,
        password,
        confirmPassword
    });

    createAndSendToken(newUser, 201, res)

})




exports.loginUser = catchAsync(async (req, res, next) => {
    const { email, password } =  req.body;
    
    //1. check if email and password exist
    if (!email || !password) {
       return next( new AppError("Please input email", 400))
    }

    //2. check if user exist and the password is correct
    const user = await User.findOne({ email }).select("+password")

    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError("Incorrect Email or password", 401))
    }
 
    createAndSendToken(user, 200, res)
    
})





exports.protectedRoute = catchAsync(async (req, res, next) => {
    //1. getting token and check if it's there
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1]
    }
    console.log(token);

    if (!token) {
        return next(new AppError("You are not authorized", 401))
    }

    //2. verifying token
    const { JWT_SECRET } = process.env;
    const decoded = await promisify(jwt.verify)(token, JWT_SECRET);
    console.log(decoded)
    
    //3. check if user still exist
    const freshUser = await User.findById(decoded.id)
    if (!freshUser) {
        return next(new AppError("The user that has this token does no longer exist", 401))
    }
 
    //4. check if the user has recently change his/her password
    if (freshUser.changedPasswordAfter(decoded.iat)) {
       return next(new AppError("User recently chnage password. Please login again", 401)) 
    }


    //GRANT ACCESS TO THE PROTECTED ROUTE
    req.User = freshUser;
    next();
})




exports.restrictTo = (...role) => {

    return (req, res, next) => {
        if (!role.includes(req.user.role)) {
            return new AppError("You are restricted from accessing this route", 403)
        }

        next()
    }
}





exports.forgotPassword = catchAsync(async (req, res, next) => {

    // 1) Get the user based on POSTed email
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      
        return next(new AppError("User does not exist", 404));
    }

    // 2) Generate the random reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // 3) Send it to the user's email
    const resetURL = `${req.protocol}://${req.get('host')}/users/resetPassword/${resetToken}`;
    const message = `Forgot your password? Submit a request with your new password and passwordConfirm to: ${resetURL}.\nIf you did not forget your password, please ignore this email.`;

    try {
        await sendEmail({
            email: user.email,
            subject: 'Your password reset token (valid for 10 minutes)',
            message
        });

        // res.status(200).json({
        //     status: "success",
        //     message: "Token sent to email"
        // });
        createAndSendToken(user, 200, res)
    } catch (error) {
        
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;

        await user.save({ validateBeforeSave: false });

        return next(new AppError("There was an error sending the email. Please try again later", 500));
    }
});




exports.resetPassword = catchAsync(async(req, res, next) => {
    // Get the user based on the token
    const { token } = req.params;
    
    const hashedToken = crypto.
        createHash("sha256")
        .update(token)
        .digest("hex");
    
    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() }
    })

    const { password, confirmPassword, passwordResetToken, passwordResetExpires } = user
    
    
    // if the token has not expired, and there is user, set the password
    if (!user) {
    return next(new AppError("Token is invalid or has expired", 400))
    }
    
   
    password = req.body.password;
    confirmPassword = req.body.confirmPassword;
    passwordResetToken = undefined;
    passwordResetExpires = undefined;

    await user.save();

    // Login user, create new JWT

    const newToken = signToken(user.id);
    res.status(200).json({
        status: 'success',
        newToken
})

})




// exports.updatePassword = catchAsync(async (req, res, next) => {
//     //1) Get the user from the collection
//     const {password, confirmPassword, currentPassword } = req.body;

//     const user = await User.findById(req.user.id).select("+password");

//     //2) check if the POSTed current password is correct
//     if (!(await user.correctPassword(currentPassword, user.password))) {
//         return next(new AppError("Your current password is wrong", 401))
//     }

//     //3) if so, update password
//     user.password = password;
//     user.confirmPassword = confirmPassword
//     await user.save()
    

//     //4) log user in, send JWT
//     // const token = signToken(user.id)

//     // res.status(200).json({
//     //     status: "success",
//     //     token
//     // })
    
//     createAndSendToken(user, 200, res)
// })

exports.updatePassword = catchAsync(async (req, res, next) => {
    // Destructure the request body
    const { currentPassword, password, confirmPassword } = req.body;

    // Ensure required fields are provided
    if (!currentPassword || !password || !confirmPassword) {
        return next(new AppError('Please provide all required fields', 400));
    }

    // Debug log for request user
    console.log(`Request User: ${JSON.stringify(req.user)}`);

    // Get the user from the collection
    const user = await User.findById(req.user.id).select("+password");
    
    // Check if user exists
    if (!user) {
        return next(new AppError("User not found", 404));
    }

    // Debug log for stored and provided passwords
    console.log(`Stored Password: ${user.password}`);
    console.log(`Provided Current Password: ${currentPassword}`);

    // Check if the posted current password is correct
    const isPasswordCorrect = await user.correctPassword(currentPassword, user.password);
    if (!isPasswordCorrect) {
        return next(new AppError("Your current password is wrong", 401));
    }

    // If so, update password
    user.password = password;
    user.confirmPassword = confirmPassword;
    
    // Save the user document
    await user.save();

    // Log user in, send JWT
    createAndSendToken(user, 200, res);
});

