import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiErrors.js";
import { User } from "../models/user.model.js"
import { uploadFileOnCloudinary } from "../utils/cloudinary.js";
import { upload } from "../middlewares/multer.middleware.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt, { decode } from "jsonwebtoken";
import clearCookie from "cookie-parser";

import cookie from "cookie-parser"
const getAccessRefreshToken = async (userID) => {
    const user = await User.findById(userID);
    const AccessToken = await user.generateAccessToken();
    const RefreshToken = await user.generateRefreshToken();
    user.RefreshToken = RefreshToken;
    await user.save({ validateBeforeSave: false });
    return { AccessToken, RefreshToken };
}


const refreshAccessToken = asyncHandler(async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

        if (!refreshToken) {
            throw new ApiError(401, "unauthorized request!!");
        }

        const decodedToken = await jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        const user = User.findById(decodedToken._id);
        if (!user) {
            throw new ApiError(401, "unauthorized request");
        }

        if (user.RefreshToken !== refreshToken) {
            throw new ApiError(401, "refresh token does not match !!");
        }
        const { AccessToken, RefreshToken } = await getAccessRefreshToken(user._id);

        const options = {
            httpOnly: true,
            secure: true
        };

        return res.status(201).
            cookie("refreshToken", RefreshToken, options).
            cookie("accessToken", AccessToken, options).
            json(
                new ApiResponse(
                    200,
                    { AccessToken, RefreshToken },
                    "refresh tokens succesful"
                )
            );
    } catch (error) {
        return new ApiError(500, "something went wrong!!");
    }
});


const registerUser = asyncHandler(async (req, res) => {
    // return res.status(200).json({
    //     message:"ok"
    // });
    // we need to register the user down now ?
    // 1. username, 2. fullname, 3.password, 4.email
    // validation - not empty
    // this is should in the request field ... we try to insert these into
    // mongodb ...
    // we also need to upload the avatar into cloudinary ...
    // create user object - create entry in db
    // remove password and refreshtoken field from the response ...
    // check for user creation
    // return res ;
    const { fullName, email, username, password } = req.body;
    console.log("email: ", email);
    const arr = [fullName, email, username, password];
    for (const i in arr) {
        if (i?.trim() === "") {
            throw new ApiError(400, "all fields are required!");
        }
    }
    const existed = await User.findOne({
        $or: [{ username }, { email }]
    });

    if (existed) {
        throw new ApiError(409, "email or username already exists");
    }
    // mera naam balla
    console.log(req.files);
    const avatar = req.files?.avatar[0]?.path;
    // const cover = req.files?..path
    const cover = null;
    if (req.files && req.files.coverImage) {
        cover = req.files.coverImage[0]?.path;
    }

    if (!avatar) {
        throw new ApiError(400, "avatar file is required!");
    }
    const avatarLink = await uploadFileOnCloudinary(avatar);
    let coverLink;
    if (cover) {
        coverLink = await uploadFileOnCloudinary(cover);
    }

    const user = await User.create({
        fullname: fullName,
        avatar: avatarLink.url,
        coverImage: coverLink ? coverLink.url : "",
        email: email,
        password: password,
        username: username.toLowerCase(),
    });



    const userCreated = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    if (!userCreated) {
        throw new ApiError(500, "something went wrong while registering");
    }
    console.log("user succesfully created!!\n");
    return res.status(201).json(new ApiResponse(200, "user registered succesfully", userCreated));
});


const loginUser = asyncHandler(async (req, res) => {
    // we need username and password only to login ...
    // afterwards we need to check whether the user exists if not then we say username is wrong
    // afterwards checking the password .. 
    // success or wrong password ....
    // after checking the password we need to give the user a access token ..
    // possibly a refreshToken if he presses the keep signin button ..
    console.log(req.body);
    const { username, password } = req.body;
    const exists = await User.findOne({ username });
    if (!exists) {
        throw new ApiError(400, "user does not exists");
    }
    console.log("user found !!");

    // we need to check whether password correct ...


    if (!await exists.isPasswordCorrect(password)) {
        throw new ApiError(400, "enter correct password!");
    }
    console.log("Login successful");

    const { RefreshToken, AccessToken } = await getAccessRefreshToken(exists._id);
    const loggedInUser = await User.findById(exists._id)
        .select("-password -refreshToken");
    const options = {
        httpOnly: true,
        secure: true
    };
    return res.status(200).cookie("accessToken", AccessToken, options)
        .cookie("refreshToken", RefreshToken, options)
        .json(
            new ApiResponse(200, {
                user: loggedInUser, AccessToken, RefreshToken
            },
                "user logged in successfully!!")
        );
});



const logoutUser = asyncHandler(async (req, res) => {

    console.log("finally");
    // we need to clear the cookies ..
    // clear refreshToken
    // how can we get the user ??? down
    const user = await User.findByIdAndUpdate(
        req.user._id
        , {
            $set: {
                refreshToken: undefined
            }
        }, {
        new: true
    }
    );

    const options = {
        httpOnly: true,
        secure: true
    };
    console.log("out of the game not placed !");
    return res.
        status(200).
        clearCookie("accessToken", options).
        clearCookie("refreshToken", options).
        json({
            success: true,
            message: "Logged out successfully"
        });

});



export { registerUser, loginUser, logoutUser,refreshAccessToken };