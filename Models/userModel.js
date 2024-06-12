const mongoose = require("mongoose");
const crypto = require('crypto');
const bcript = require('bcryptjs')
const validator = require('validator')


const { Schema } = mongoose;

const userSchema = new Schema({
    name: {
        type: String,
        require : [true, 'Please insert your full name']
    },
    email: {
        type: String,
        unique: [true, 'This email is already signed in, please try login if you are the owner of the email.'],
        require: [true, "Please input your email"],
        lowercase : true,
        validate : [validator.isEmail, 'Chose a valid email'], 
    },
    role: {
        type: String,
        enum: ['user', 'admin'], 
        default : "user"
    },
    photo : String,
    password: {
        type: String,
        required: [true, "Kindly provide your password"],
        minlength: 8,
        select: false,
    },
    confirmPassword: {
        type: String,
        required: [true, "please confirm your password"],
        validator: function(el) {
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

//compare the inputed password with the original user password
userSchema.method.correctPassword = async function(candidatePassword, userPassword) {
    
    return await bcript.compare(candidatePassword, userPassword)
}

const User = mongoose.model('users', userSchema);
module.exports = User; 