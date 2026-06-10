import { asyncHandler } from "../utils/asyncHandler.js"

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
    console.log("email: ",email);
});


export { registerUser };