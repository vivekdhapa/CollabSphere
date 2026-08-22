import { User } from "../models/user.models.js";
import { Project } from "../models/project.models.js";
import { Task } from "../models/task.models.js";
import { Subtask } from "../models/subtask.models.js";

import { ApiResponse } from "../utils/api-response.js"
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import { emailVerificationMailgenContent, forgotPasswordMailgenContent, sendEmail } from "../utils/mail.js";
import jwt from "jsonwebtoken";
import * as crypto from "crypto";
import mongoose, { mongo } from "mongoose";
import { AvailableUserRole, UserRolesEnum } from "../utils/constants.js";
// import { pipeline } from "nodemailer/lib/xoauth2/index.js";

const getTasks = asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const project = await Project.findById(projectId)
    if (!project) {
        throw new ApiError(404, "Project not found")
    }
    const tasks = await Task.find({
        project: new mongoose.Types.ObjectId(projectId)
    }).populate("assignedTo", "avatar username fullName");

    return res
        .status(201)
        .json(new ApiResponse(201, tasks, "Task fetched successfully"))
})


const getTaskById = asyncHandler(async (req, res) => {
    const { taskId } = req.params
    const task = await Task.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(taskId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "assignedTo",
                foreignField: "_id",
                as: "assignedTo",
                pipeline: [
                    {
                        $project: {
                            _id: 1,
                            username: 1,
                            fullName: 1,
                            avatar: 1,
                        }

                    }
                ]
            }
        },
        {
            $lookup: {
                from: "subtasks",
                localField: "_id",
                foreignField: "task",
                as: "subtasks",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "createdBy",
                            foreignField: "_id",
                            as: "createdBy",
                            pipeline: [
                                {
                                    $project: {
                                        _id: 1,
                                        username: 1,
                                        fullName: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            createdBy: {
                                $arrayElemAt: ["$createdBy", 0]
                            }
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                assignedTo: {
                    $arrayElemAt: ["$assignedTo", 0]
                }
            }
        }
    ]);

    if (!task || task.length === 0) {
        throw new ApiError(404, "Task not found")
    }

    return res.status(200).json(new ApiResponse(200, task[0], "Task fetched successfully"))
})


const createTask = asyncHandler(async (req, res) => {
    const { title, description, assignedTo, status, dueDate } = req.body;
    const { projectId } = req.params;

    const project = await Project.findById(projectId)
    if (!project) {
        throw new ApiError(404, "Project not found")
    }
    const files = req.files || []
    const attachments = files.map((file) => {
        return {
            url: `${process.env.SERVER_URL}/images/${file.filename}`,
            mimetype: file.mimetype,
            size: file.size
        }
    })

    const task = await Task.create({
        title,
        description,
        project: new mongoose.Types.ObjectId(projectId),
        assignedTo: assignedTo ? new mongoose.Types.ObjectId(assignedTo) : undefined,
        status,
        assignedBy: new mongoose.Types.ObjectId(req.user._id),
        attachments,
        dueDate: dueDate ? new Date(dueDate) : undefined,
    });

    return res
        .status(201)
        .json(new ApiResponse(201, task, "Task created successfully"))

})


const updateTask = asyncHandler(async (req, res) => {
    const { taskId, projectId } = req.params
    const { title, description, assignedTo, status, dueDate } = req.body;

    const task = await Task.findOne({
        _id: taskId,
        project: projectId
    })
    if (!task) {
        throw new ApiError(404, "Task not found");
    }

    const files = req.files || [];
    const newAttachments = files.map((file) => ({
        url: `${process.env.SERVER_URL}/images/${file.filename}`,
        mimetype: file.mimetype,
        size: file.size,
    }));

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (assignedTo !== undefined) {
        task.assignedTo = new mongoose.Types.ObjectId(assignedTo);
    }
    if (status !== undefined) task.status = status;
    if (newAttachments.length > 0) {
        task.attachments = [...task.attachments, ...newAttachments];
    }
    if (dueDate !== undefined) {
        task.dueDate = new Date(dueDate);
    }
    await task.save();

    return res
        .status(200)
        .json(new ApiResponse(200, task, "Task updated successfully"));

})


const deleteTask = asyncHandler(async (req, res) => {
    const { taskId, projectId } = req.params

    const task = await Task.findOneAndDelete({
        _id: taskId,
        project: projectId
    })

    if (!task) {
        throw new ApiError(404, "Task not found")
    }
    // cascade delete: a task's subtasks shouldn't be orphaned
    await Subtask.deleteMany({ task: task._id });
    return res
        .status(200)
        .json(new ApiResponse(200, task, "Task deleted successfully"));
})

const createSubTask = asyncHandler(async (req, res) => {
    const { taskId, projectId } = req.params;
    const { title } = req.body

    const task = await Task.findOne({ _id: taskId, project: projectId });
    if (!task) {
        throw new ApiError(404, "Task not found");
    }

    const subtask = await Subtask.create({
        title,
        task: new mongoose.Types.ObjectId(taskId),
        createdBy: new mongoose.Types.ObjectId(req.user._id),
    });

    if (!subtask) {
        throw new ApiError(400, "Error adding subtask")
    }

    return res
        .status(201)
        .json(new ApiResponse(201, subtask, "Subtask created successfully"));


})

const updateSubTask = asyncHandler(async (req, res) => {
    const { subTaskId } = req.params;
    const { title, isCompleted } = req.body;

    const subtask = await Subtask.findById(subTaskId);
    if (!subtask) {
        throw new ApiError(404, "Subtask not found");
    }

    if (req.user.role === UserRolesEnum.MEMBER) {
        if (title !== undefined) {
            throw new ApiError(403, "Members can only update completion status");
        }
        if (isCompleted !== undefined) subtask.isCompleted = isCompleted;
    } else {
        if (title !== undefined) subtask.title = title;
        if (isCompleted !== undefined) subtask.isCompleted = isCompleted;
    }

    await subtask.save();

    return res
        .status(200)
        .json(new ApiResponse(200, subtask, "Subtask updated successfully"));
})

const deleteSubTask = asyncHandler(async (req, res) => {
    const { subTaskId } = req.params;

    const subtask = await Subtask.findByIdAndDelete(subTaskId);
    if (!subtask) {
        throw new ApiError(404, "Subtask not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, subtask, "Subtask deleted successfully"));
});


export {
    createTask,
    createSubTask,
    updateTask,
    updateSubTask,
    deleteTask,
    deleteSubTask,
    getTasks,
    getTaskById

}