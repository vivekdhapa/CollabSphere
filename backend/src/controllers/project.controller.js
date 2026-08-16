import { User } from "../models/user.models.js";
import { Project } from "../models/project.models.js";
import { ProjectMember } from "../models/projectmember.models.js";

import {ApiResponse} from "../utils/api-response.js"
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import { emailVerificationMailgenContent, forgotPasswordMailgenContent, sendEmail } from "../utils/mail.js";
import jwt from "jsonwebtoken";
import * as crypto from "crypto";
import mongoose, { mongo } from "mongoose";
import { AvailableUserRole, UserRolesEnum } from "../utils/constants.js";


//so the user is already logged in-> we have their verify jwt tokens -> we have access to req.user

const createProject = asyncHandler(async(req,res)=>{
    const {name,description} = req.body

    const project = await Project.create({
        name,
        description,
        // createdBy: req.user._id (string format)
        createdBy:new mongoose.Types.ObjectId(req.user._id),
    });
    //whoever creates a project should be elected as admin

    await ProjectMember.create({
        user:new mongoose.Types.ObjectId(req.user._id),
        project:new mongoose.Types.ObjectId(project._id),
        role:UserRolesEnum.ADMIN
    })

    return res.status(201).json(
        new ApiResponse(201,project,"Project created successfully")
    )
});

const updateProject = asyncHandler(async(req,res)=>{
    const {name,description}=req.body
    const {projectId}=req.params

    const project = await Project.findByIdAndUpdate(
        projectId,
        {
            name,
            description
        },
        {new:true}
    )

    if(!project){
        throw new ApiError(404,"project not found")
    }

    return res.status(200).json(
        new ApiResponse(200,project,"Project updated successfully")
    )
});

const deleteProject = asyncHandler(async(req,res)=>{
    const {projectId}= req.params
    const project = await Project.findByIdAndDelete(projectId)

    if(!project){
        throw new ApiError(404,"project not found")
    }

    return res.status(200).json(
        new ApiResponse(200,project,"Project deleted successfully")
    )
});


// monogodb aggregation pipeline used here
const getProjects = asyncHandler(async(req,res)=>{
    //we have to grab the projects which you have created
    //project memeber schema has user as well as projects
    const projects = await ProjectMember.aggregate([
        {  //matches all the doc which matches this criteria
            $match:{
                user:new mongoose.Types.ObjectId(req.user._id)
            },
        },{  
            $lookup:{
                from:"projects", //lowercase and prural coz of db 
                localField:"projects",
                foreignField:"_id",
                as:"projects",
                pipeline:[
                    {
                        $lookup:{
                            from:"projectmembers",
                            localField:"_id",
                            foreignField:"projects",
                            as:"projectmembers"
                        }
                    },
                    {
                        $addFields:{
                            members:{
                                $size:"$projectmembers"
                            }
                        }
                    }
                ]
            }
        },{
            $unwind:"$projects"
        },
        {
            $project:{
                    project:{
                        _id:1,
                        name:1,
                        description:1,
                        members:1,
                        createdBy:1,
                        createdAt:1,
                    },
                    role:1,
                    _id:0
            }
        }
    ])

    return res.status(200).json(new ApiResponse(200,projects,"Projects fetched successfully"))
});


const getProjectById = asyncHandler(async(req,res)=>{
    const {projectId}= req.params
    const project = await Project.findById(projectId)

    if(!project){
        throw new ApiError(404,"Project not found");
    }

    return res.status(200).json(new ApiResponse(200,project,"Project fetched successfully"))
});


const addMembersToProject = asyncHandler(async(req,res)=>{
    const {email,role}=req.body
    const {projectId} = req.params
    const user=await User.findOne({email})
    if(!user){
        throw new ApiError(404,"User does not exists")
    }
    await ProjectMember.findOneAndUpdate(
        {
            user:new mongoose.Types.ObjectId(user._id),
            project:new mongoose.Types.ObjectId(projectId)
        },
        {
            user:new mongoose.Types.ObjectId(user._id),
            project:new mongoose.Types.ObjectId(projectId),
            role:role
        },
        {
            new:true,
            upsert:true //creates new doc if non of them exists
        }
    )
        
    return res.status(201).json(new ApiResponse(201,{},"Project member added successfully"))


});

const getProjectMembers = asyncHandler(async(req,res)=>{
    const {projectId} = req.params
    const project=await Project.findById(projectId)
    if(!project){
        throw new ApiError(404,"project not found")
    }

    const projectMembers = await ProjectMember.aggregate([
        {
            $match:{
                project:new mongoose.Types.ObjectId(projectId),
            }
        },
        {
            $lookup:{
                from:"users",
                localField:"user",
                foreignField:"_id",
                as:"user",
                pipeline:[
                    {
                        $project:{
                            _id:1,
                            username:1,
                            fullName:1,
                            avatar:1,
                        }
                    }
                ]
            }
        },
        {
            $addFields:{
                user:{
                    $arrayElemAt:["$user",0]
                }
            }
        },
        {
            $project:{
                project:1,
                user:1,
                role:1,
                createdAt:1,
                updatedAt:1,
                _id:0,
            }
        }
    ])


    return res.status(200).json(
        new ApiResponse(200,projectMembers,"Project members fetched successfully")
    )


});

const updateMemberRole = asyncHandler(async(req,res)=>{
    const {projectId,userId} = req.params
    const {newRole}=req.body
    if(!AvailableUserRole.includes(newRole)){
        throw new ApiError(400,"Invalid role")
    }

    let projectMember=await ProjectMember.findOne({
        project:new mongoose.Types.ObjectId(projectId),
        user: new mongoose.Types.ObjectId(userId)
    })

    if(!projectMember){
        throw new ApiError(400,"Project member not found")
    }

    projectMember = await ProjectMember.findByIdAndUpdate(
        projectMember._id,
        {
            role:newRole
        },{
            new:true
        }
    )

    if(!projectMember){
        throw new ApiError(400,"Project member not found")
    }

        return res.status(200).json(
        new ApiResponse(200,projectMember,"Project member role updated successfully")
    )


});

const deleteMember = asyncHandler(async(req,res)=>{
     const {projectId,userId} = req.params


    let projectMember=await ProjectMember.findOne({
        project:new mongoose.Types.ObjectId(projectId),
        user: new mongoose.Types.ObjectId(userId)
    })

    if(!projectMember){
        throw new ApiError(400,"Project member not found")
    }

    projectMember = await ProjectMember.findByIdAndDelete(
        projectMember._id,
    )

    if(!projectMember){
        throw new ApiError(400,"Project member not found")
    }

        return res.status(200).json(
        new ApiResponse(200,projectMember,"Project member deleted successfully")
    )

});


export { 
    getProjects,
    getProjectById,
    createProject,
    updateProject,
    deleteProject,
    addMembersToProject,
    getProjectMembers,
    updateMemberRole,
    deleteMember
}