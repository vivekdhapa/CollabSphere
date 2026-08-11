//higher order function=taking function as input and returning a function as an output
// asyncHandler is a higher order function
const asyncHandler = (requestHandler)=>{
    return (req,res,next)=>{
        Promise
        .resolve(requestHandler(req,res,next))
        .catch((err)=>next(err))
    }
}
export { asyncHandler };