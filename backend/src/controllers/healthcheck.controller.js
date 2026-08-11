import {ApiResponse} from "../utils/api-response.js"
import { asyncHandler } from "../utils/async-handler.js";
/*
const healthCheck=async (req,res,next)=>{
    try {
        const user=await getUserFromDB()
        res
        .status(200)
        .json(new ApiResponse(200,{message:"server is running"}));
    } catch (error) {
        next(err)
    }
};
*/

const healthCheck=asyncHandler(async (req,res)=>{
    res.status(200).json(new ApiResponse(200,{mesaage:"Server is running"}));
});

//with this approach we dont have to write catch part for most of the time,it automatically handles errors 



export {healthCheck};