import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiErrors.js";
import { User } from "../models/user.model.js"
import { uploadFileOnCloudinary } from "../utils/cloudinary.js";
import { upload } from "../middlewares/multer.middleware.js";
import { ApiResponse } from "../utils/ApiResponse.js";

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
    for (i in arr) {
        if (i.trim() === "") {
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
    const cover = req.files?.coverImage[0]?.path;

    if (!avatar) {
        throw new ApiError(400, "avatar file is required!");
    }
    const avatarLink = await uploadFileOnCloudinary(avatar);
    const coverLink;
    if (cover) {
        coverLink = await uploadFileOnCloudinary(cover);
    }

    const user = await User.create({
        fullName,
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
        return new ApiError(500, "something went wrong while registering");
    }
    console.log("user succesfully created!!\n");
    return res.status(201).json(new ApiResponse(200, "user registered succesfully"));
});


export { registerUser };