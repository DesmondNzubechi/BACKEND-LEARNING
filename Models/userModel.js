const mongoose = require("mongoose");
const crypto = require('crypto');
const bcript = require('bcryptjs')
const validator = require('validator')


const { Schema } = mongoose;

const userSchema = new Schema({
    name: {
        type: String,
        unique: [true, "A iser already existed with this name"],
        require : [true, 'Please insert your full name']
    },
    email: {
        type: String,
        unique: [true, 'This email is already signed in, please try login if you are the owner of the email.'],
        require: [true, "Please input your email"],
        validate : [validator.isEmail, 'Chose a valid email'], 
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default : "user"
    },
    password: {
        type: String,
        require: [true, "Kindly provide your password"],
    },
    confirmPassword: {
        type: String,
        require: [true, "please confirm your password"],
        validator: (el) => {
            return el === this.password
        },
        message: "Password are not the same"
    },
    passwordChangedat: Date,
    passwordResetToken: String,
    passwordResetTokenExpires: Date,
    active: {
        type: Boolean,
        default: true,
        select : false,
    }
})

userSchema.pre('save', async function (next) {
    
    //execute this function if the password is modified
    if (!this.isModified('password')) return next();

    //hash password
    this.password = await bcript.hash(this.password, 12);

    //delete confirm password
    this.confirmPassword = undefined;
    next();
})



const User = mongoose.model('users', userSchema);
module.exports = User;