import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js";
import { User } from '../models/user.model.js'
import { uploadOnCloudinary } from "../utils/Cloudinary.js";
import { ApiResponse}  from "../utils/ApiResponse.js";

const registerUser = asyncHandler(
    async (req, res) => {
        //get user detail from frontend 
        //validation 
        //check if already existed : username , email
        //check for images , check for avatar
        //upload them to cloudinary 
        //create user object - create entry in db 
        //remove password and refresh token field from response
        //check for user creation 
        // return response

        const { username, email, fullName, password } = req.body
        console.log("email: ", email);

        if ([fullName, email, username, password].some((field) => field?.trim === "")) {
            throw new ApiError(400, "all filed is compulsory ")
        }

        const existedUser = User.findOne({
            $or: [{ username }, { email }]
        })
        // User.findOne(username) //for single argument

        if (existedUser) {
            throw new ApiError(409, "user with email or username already exist")
        }

        const avatarLocalPath = req.files?.avatar[0]?.path
        const coverImageLocalPath = req.files?.coverImage[0]?.path

        if (!avatarLocalPath) {
            throw new ApiError(400, " avatar file is required")
        }

        const avatar = await uploadOnCloudinary(avatarLocalPath)
        const coverImage = await uploadOnCloudinary(coverImageLocalPath)

        if (!avatar) {
            throw new ApiError(400, " avatar file is required")
        }

     const user = await User.create({
            fullName,
            avatar: avatar.url,
            coverImage: coverImage?.url || "",
            email,
            password,
            username: username.toLowerCase()
        })

        const createdUser = await User.findById(user._id).select(
            "-password -refreshToken"
        )
        if(!createdUser){
            throw new ApiError(500," something went wrong while registering user")
        }

        return res.status(201).json(
            new ApiResponse(200, createdUser , "user registered succesfully")
        )

        // res.status(200).json({
        //     message: "hi im divy"
        // })
    })

export { registerUser }