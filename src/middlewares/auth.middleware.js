import { ApiError } from "../utils/ApiErrors.js";
import { asyncHandler } from "../utils/asyncHandler.js";
// import jwt from JsonWebToken;
import { User } from "../models/user.model.js"
import jwt from "jsonwebtoken";
// import { ApiError } from "../utils/ApiErrors";
export const verifyJWT = asyncHandler(async (req, _, next) => {
    try {
        console.log("here");
        const accessToken = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
        if (!accessToken) {
            throw new ApiError(401, "unauthorized request!!");
        }
        const decodedID = await jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decodedID._id).select("-password -refreshToken");
        if (!user) {
            // TODO: discuss about frontend 
            throw new ApiError(401, "invalid access token !!");
        }
        req.user = user;
        console.log("lets go!!");
        next();
    } catch (error) {
        throw new ApiError(401, error ? error : "invalid access token");
    }
});

