import { User } from "../models/user.models.js";
import {ApiResponse} from "../utils/api-response.js"
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import { emailVerificationMailgenContent, forgotPasswordMailgenContent, sendEmail } from "../utils/mail.js";
import jwt from "jsonwebtoken";
import * as crypto from "crypto";


const generateAccessAndRefreshTokens=async(userId)=>{
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken //saving on db
        await user.save({validateBeforeSave:false}) //dont validate all the data , we have just changed refreshtoken only

        return {accessToken,refreshToken}
    } catch (error) {
        throw new ApiError(
            500,
            "Something went wrong while generating access token."
        )
    }
}

const registerUser=asyncHandler(async(req,res)=>{
    //from frntd data comes from body assuming
    // destructring body's data
    const {email,username,password,role,fullName}=req.body

    const existedUser=await User.findOne({
        $or:[{username},{email}] //search on db
    })

    if(existedUser){
        throw new ApiError(409,"User with email or usename already exists",[])
    }
    
    const user=await  User.create({
        email,
        password,
        username,
        fullName,
        isEmailVerified:false
    })

    const { unHashedToken,hashedToken,tokenExpiry }=user.generateTemporaryToken();


    user.emailVerificationToken = hashedToken
    user.emailVerificationExpiry = tokenExpiry
    await user.save({validateBeforeSave:false})


    await sendEmail(
        {
            email:user?.email,
            subject:"Please verify your email",
            mailgenContent:emailVerificationMailgenContent(
                user.username,
                `${process.env.EMAIL_VERIFICATION_REDIRECT_URL}/${unHashedToken}` //dynamic link
            )
        }
    )

    const createdUser = await User.findById(user._id).select(
        "-password -emailVerificationToken -refreshToken -emailVerificationExpiry "
    )
    if(!createdUser){
        throw new ApiError(500,"Something went wrong while registering a user")
    }

    return res.status(201).json(
        new ApiResponse(
            200,
            { user: createdUser},
            "User registered successfully and verification email has been sent to your email"
        ),
    );
}) 

//WRITING LOGIN LOGIC
const login = asyncHandler(async (req,res)=>{
    const { email,password,username } = req.body

    if(!email){
        throw new ApiError(400,"Email is required")
    }

    const user = await User.findOne({email});
    if(!user){
        throw new ApiError(400,"User does not exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password);
     
    if(!isPasswordValid){
        throw new ApiError(400,"Invalid credentials")
    }

    const {accessToken,refreshToken} = await generateAccessAndRefreshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select(
        "-password -emailVerificationToken -refreshToken -emailVerificationExpiry "
    );


    //cookies sending
    const options={
        httpOnly:true,
        secure:true
    }
    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(new ApiResponse(200,{
        user:loggedInUser,
        accessToken,
        refreshToken,
        },
        "User logged in successfully"
));
    

});

//WRITING LOGOUT LOGIC
const logoutUser=asyncHandler(async(req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken:"",
            },
        },{
            new:true,
        }
    );

    const options={
        httpOnly:true,
        secure:true
    }

    return res
        .status(200)
        .clearCookie("accessToken",options)
        .clearCookie("refreshToken",options)
        .json(new ApiResponse(200,"User logged out successfully"))
});

//Get current user info (secured)
const getCurrentUser=asyncHandler(async(req,res)=>{
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                req.user,
                "Current user fetched successfully"
            )
        )
});

//Email Verification
const verifyEmail = asyncHandler(async(req,res)=>{
    const {verificationToken} = req.params
    if(!verificationToken){
        throw new ApiError(400,"Email verification token is missing");
    }
    
    let hashedToken=crypto
    .createHash("sha256")
    .update(verificationToken)
    .digest("hex")
    
    const user = await User.findOne({
        emailVerificationToken:hashedToken,
        emailVerificationExpiry:{$gt:Date.now()}
    })
    if(!user){
        throw new ApiError(400,"Token is expired or invalid");
    }

    user.emailVerificationToken=undefined;
    user.emailVerificationExpiry=undefined;

    user.isEmailVerified=true
    await user.save({validateBeforeSave:false})
    
    return res.status(200).json(new ApiResponse(200,{isEmailVerified:true},"Email is verified"))
})

//Resend Email Verification
const resendEmailVerification=asyncHandler(async(req,res)=>{
    const user = await User.findById(req.user?._id);

    if(!user){
        throw new ApiError(404,"User does not exist");
    }

    if(user.isEmailVerified){
        throw new ApiError(409,"Email is already verified");
    }

    //resending part
    const { unHashedToken,hashedToken,tokenExpiry }=user.generateTemporaryToken();


    user.emailVerificationToken = hashedToken
    user.emailVerificationExpiry = tokenExpiry
    await user.save({validateBeforeSave:false})


    await sendEmail(
        {
            email:user?.email,
            subject:"Please verify your email",
            mailgenContent:emailVerificationMailgenContent(
                user.username,
                `${process.env.EMAIL_VERIFICATION_REDIRECT_URL}/${unHashedToken}` //dynamic link
            )
        }
    ) 


    return res.status(200).json(new ApiResponse(200,{},"Mail has been sent to your email ID"));
})

//REFRESH ACCESS TOKEN
const refreshAccessToken = asyncHandler(async(req,res)=>{
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken){
        throw new ApiError(401,"Unauthorized Access");
    }
    
    try {
        const decodedToken= jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)
        
        const user = await User.findById(decodedToken?._id);
        
        if(!user){
            throw new ApiError(401,"Invalid Refresh Token");
        }
        
        if(incomingRefreshToken !=user?.refreshToken){
            throw new ApiError(401,"Refresh Token is expired")
        }
        
        const options={
            httpOnly:true,
            secure:true
        }
        
        const {accessToken,refreshToken:newRefreshToken} = await generateAccessAndRefreshTokens(user._id)
        user.refreshToken=newRefreshToken;
        await user.save()
        
        return res.status(200).cookie("accessToken",accessToken,options).cookie("refreshToken",refreshToken,options).json(new ApiResponse(200,{accessToken,refreshToken:newRefreshToken},"Access Token refreshed"));
        
    } catch (error) {
        console.log("Refresh token error:",error)
        throw new ApiError(401,error?.message||"Invalid Refresh Token");
        
    }

})





//FORGOT PASSWORD AND PASSWORD RESETTING LOGIC

// /forgot-password-email containing tokens is sent to user 
const forgotPasswordRequest=asyncHandler(async(req,res)=>{
    const { email } = req.body //get email from user
    
    const user = await User.findOne({email}) //find in db the email
    
    if(!user){
        throw new ApiError(404,"User does not exists",[])
    }
    
    const {unHashedToken,hashedToken,tokenExpiry} =user.generateTemporaryToken();
    
    user.forgotPasswordToken=hashedToken
    user.forgotPasswordExpiry=tokenExpiry
    
    await user.save({validateBeforeSave:false})
    
    await sendEmail({
        email:user?.email,
        subject:"Password reset request",
        mailgenContent:forgotPasswordMailgenContent(
            user.username,
            `${process.env.FORGOT_PASSWORD_REDIRECT_URL}/${unHashedToken}`,
        ),
    })
    
    return res.status(200).json(new ApiResponse(200,{},"Password reset mail has been sent on your mail id"))
    
})


// /reset-password - that tokens are used to reset the password while the user is still logged out

const resetForgotPassword = asyncHandler(async(req,res)=>{
    const {resetToken} = req.params //token from url  -unhashed
    const {newPassword} = req.body  //user's input

    let hashedToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex")

        const user = await User.findOne({
            forgotPasswordToken:hashedToken,
            forgotPasswordExpiry: {$gt:Date.now()}
        })

        if(!user){
        throw new ApiError(489,"Token is invalid or expired ")
        }

    user.forgotPasswordExpiry=undefined
    user.forgotPasswordToken=undefined

    user.password=newPassword
    await user.save({validateBeforeSave:false})

    return res
        .status(200)
        .json(new ApiResponse(200,{},"Password reset successfully"));


});

// /change-password - used when the user is logged in and want to change password

const changeCurrentPassword=asyncHandler(async(req,res)=>{
    const {oldPassword,newPassword}=req.body

    const user = await User.findById(req.user?._id);

    const isPasswordValid = await user.isPasswordCorrect(oldPassword)

    if(!isPasswordValid){
        throw new ApiError(400,"Invalid old password")
    }

    user.password=newPassword
    await user.save({validateBeforeSave:false})

    return res
        .status(200)
        .json(new ApiResponse(200,{},"Password changed successfully"));

})



    // const getCurrentUser=asyncHandler(async(req,res)=>{})
        
        
        
        
        
        export { registerUser,
                login,
                logoutUser,
                getCurrentUser,
                verifyEmail,
                resendEmailVerification,
                refreshAccessToken,
                forgotPasswordRequest,
                resetForgotPassword,
                changeCurrentPassword
             };
