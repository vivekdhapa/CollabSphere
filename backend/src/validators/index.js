import { body } from "express-validator";
import { AvailableUserRole } from "../utils/constants.js";
import { AvailableTaskStatus } from "../utils/constants.js";

const userRegisterValidator = ()=>{
    return [ //extrated from express validator
        body("email")
            .trim()
            .notEmpty()
            .withMessage("Email is required")
            .isEmail()
            .withMessage("Email is invalid"),
        body("username")
            .trim()
            .notEmpty()
            .isLowercase()
            .withMessage("Username must be in lowercase")
            .isLength({min:3})
            .withMessage("Username must be at least 3 characters long"),
        body("password")
            .trim()
            .notEmpty()
            .withMessage("Password is required"),
        body("fullName")
            .optional()
            .trim(),
    ];
}

const userLoginValidator = ()=>{
    return[
        body("email").optional().isEmail().withMessage("Email is invalid"),
        body("password").notEmpty().withMessage("Password is required")
    ]
}


const userChangeCurrentPasswordValidator=()=>{
    return [
        body("oldPassword").notEmpty().withMessage("Old password is required"),
        body("newPassword").notEmpty().withMessage("New password is required"),
    ]
}


const userForgotPasswordValidator=()=>{
    return[
        body("email")
            .notEmpty()
            .withMessage("Email is required")
            .isEmail()
            .withMessage("Invalid email")
    ]
}

const userResetForgotPasswordValidator=()=>{
    return[
        body("newPassword")
            .notEmpty()
            .withMessage("Password is required")
    ]
}

const createProjectValidator=()=>{
    return [
        body("name")
            .notEmpty()
            .withMessage("Name is required"),
        body("description").optional()
    ];
}

const addMembertoProjectValidator=()=>{
    return [
        body("email")
            .trim()
            .notEmpty()
            .withMessage("Email is required")
            .isEmail()
            .withMessage("Email is invalid"),
        body("role")
            .notEmpty()
            .withMessage("Role is required")
            .isIn(AvailableUserRole)
            .withMessage("Role is invalid")
    ];    
}

const createTaskValidator = () => {
    return [
        body("title").trim().notEmpty().withMessage("Title is required"),
        body("description").optional().trim(),
        body("assignedTo").optional().isMongoId().withMessage("Invalid assignee id"),
        body("status").optional().isIn(AvailableTaskStatus).withMessage("Invalid status"),
    ];
};

const updateTaskValidator = () => {
    return [
        body("title").optional().trim().notEmpty().withMessage("Title cannot be empty"),
        body("description").optional().trim(),
        body("assignedTo").optional().isMongoId().withMessage("Invalid assignee id"),
        body("status").optional().isIn(AvailableTaskStatus).withMessage("Invalid status"),
    ];
};

const createSubTaskValidator = () => {
    return [body("title").trim().notEmpty().withMessage("Title is required")];
};

const updateSubTaskValidator = () => {
    return [
        body("title").optional().trim().notEmpty().withMessage("Title cannot be empty"),
        body("isCompleted").optional().isBoolean().withMessage("isCompleted must be boolean"),
    ];
};

const createNoteValidator = () => {
    return [body("content").trim().notEmpty().withMessage("Content is required")];
};

const updateNoteValidator = () => {
    return [body("content").trim().notEmpty().withMessage("Content is required")];
};

export{
    userRegisterValidator,
    userLoginValidator,
    userChangeCurrentPasswordValidator,
    userForgotPasswordValidator,
    userResetForgotPasswordValidator,
    createProjectValidator,
    addMembertoProjectValidator,
    createTaskValidator,
    updateTaskValidator,
    createSubTaskValidator,
    updateSubTaskValidator,
    createNoteValidator,
    updateNoteValidator
}