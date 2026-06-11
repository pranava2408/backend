import { v2 as cloudinary } from 'cloudinary';
import fs from "fs";
import dotenv from "dotenv";
dotenv.config({
    path: './.env'
});

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
});


const uploadFileOnCloudinary = async(localFilePath)=>{
    try {
        if(!localFilePath){
            return null;        
        }
        // try to upload on cloudinary 
        const response = await cloudinary.uploader.upload(localFilePath,{
            resource_type: "auto"
        });
        // file has been successfully i guess
        console.log('File has been succesfully uploaded !\n');
        console.log(response);
        return response;
    } catch (error) {
        // console.log("check the working ",process.env.CLOUDINARY_CLOUD_NAME);
        console.log("Cloud Name:", process.env.CLOUDINARY_CLOUD_NAME);
console.log("API Key:", process.env.CLOUDINARY_API_KEY);
console.log("API Secret:", process.env.CLOUDINARY_API_SECRET);
        console.log("cloudinary error");
        console.log(error);
        fs.unlinkSync(localFilePath);
        // we are just removing the locally saved file because the 
        // the upload has failed !!
    }
}


export {uploadFileOnCloudinary};
// (async function() {

//     // Configuration
    
//     // Upload an image
//      const uploadResult = await cloudinary.uploader
//        .upload(
//            'https://res.cloudinary.com/demo/image/upload/getting-started/shoes.jpg', {
//                public_id: 'shoes',
//            }
//        )
//        .catch((error) => {
//            console.log(error);
//        });
    
//     console.log(uploadResult);
    
//     // Optimize delivery by resizing and applying auto-format and auto-quality
//     const optimizeUrl = cloudinary.url('shoes', {
//         fetch_format: 'auto',
//         quality: 'auto'
//     });
    
//     console.log(optimizeUrl);
    
//     // Transform the image: auto-crop to square aspect_ratio
//     const autoCropUrl = cloudinary.url('shoes', {
//         crop: 'auto',
//         gravity: 'auto',
//         width: 500,
//         height: 500,
//     });
    
//     console.log(autoCropUrl);    
// })();