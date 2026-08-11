import mongoose,{ Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";

//defining a schema
const userSchema=new Schema(
    {
        avatar:{
            type:{
                url:String,
                localPath:String,
            },
            default:{
                url:`https://placehold.co/200x200`,
                localPath:""
            }
        },
        username:{
            type:String,
            required:true,
            unique:true,
            lowercase:true,
            trim:true,
            index:true
        },
        email:{
            type:String,
            required:true,
            unique:true,
            lowercase:true,
            trim:true,            
        },
        fullName:{
            type:String,
            trim:true
        },
        password:{
            type:String,
            required:[true,"Password is required"]
        },
        isEmailVerified:{
            type:Boolean,
            default:false
        },
        refreshToken:{
            type:String
        },
        forgotPasswordToken:{
            type:String
        },
        forgotPasswordExpiry:{
            type:Date
        },
        emailVerificationToken:{
            type:String
        },
        emailVerificationExpiry:{
            type:Date
        }
    },{
        timestamps:true,
    }
)

//PreHook-before saving the data performing an action
//this hook will run every time when data is saved, so eg if we changed even the name ,this will change the hashed password
userSchema.pre("save",async function(){
    if(!this.isModified("password")) return
    this.password=await bcrypt.hash(this.password,10)
    
})

userSchema.methods.isPasswordCorrect=async function(password) {
    return await bcrypt.compare(password,this.password)
}

//generating access tokens and refresh tokens
userSchema.methods.generateAccessToken=function(){
    return jwt.sign(
        {    //payload
            _id:this._id,
            email:this.email,
            username:this.username
        },
        process.env.ACCESS_TOKEN_SECRET,
        {expiresIn:process.env.ACCESS_TOKEN_EXPIRY}
    )
}
userSchema.methods.generateRefreshToken=function(){
    return jwt.sign(
        {    //payload
            _id:this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {expiresIn:process.env.REFRESH_TOKEN_EXPIRY}
    )
}

//generating temporary tokens used for eg forgot password
userSchema.methods.generateTemporaryToken=function(){
    const unHashedToken=crypto.randomBytes(20).toString("hex")

    //since we will store this token in our db temporarily
    const hashedToken=crypto
        .createHash("sha256") //algo name
        .update(unHashedToken)
        .digest("hex")
    const tokenExpiry=Date.now() + (20*60*1000)  //20mins

    return {unHashedToken,hashedToken,tokenExpiry}

}

//exporting a schema
export const User=mongoose.model("User",userSchema) //when it goes to mongodb it automatically converts into lowercase and prurals -> users 