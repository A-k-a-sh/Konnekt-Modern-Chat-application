
import CryptoJS from "crypto-js";





const CLOUD_NAME ='don2ndgoj'
const API_KEY='786234832985487'
const API_SECRET= '1jvjkRmNN-bjpM8AFm66jD3yBBw'

const CLOUDINARY_URL= `cloudinary:${API_KEY}:${API_SECRET}@don2ndgoj`

export const cloudinaryUpload = async (fileInfo) => {

    const { file } = fileInfo
    let {type : fileType} = fileInfo

    const validTypes = ["image", "video"];
    if (!validTypes.includes(fileType)) {
        fileType = "raw"; // Cloudinary uses "raw" for documents like PDFs, etc.
    }

    const data = new FormData()

    data.append('file', file)
    data.append('upload_preset', 'ChatAppMedia')
    data.append('cloud_name', 'don2ndgoj')
    data.append('folder' , 'ChatApp')
    data.append('quality' , 'auto')



    try {

        const response = await fetch(`https://api.cloudinary.com/v1_1/don2ndgoj/${fileType}/upload`, {
            method: "POST",
            body: data,

        });

        if (!response.ok) {
            throw new Error(`Failed to upload file to Cloudinary ${response.statusText}`);
        }

        const result = await response.json();
        return {
            url : result.secure_url,
            public_id : result.public_id,
            resource_type: result.resource_type, 
        };
        
    } catch (error) {
        
        console.log(error);
        return null
    }
}



export const cloudinaryDelete = async (public_id , resource_type) => {

    const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resource_type}/destroy`;

    const timestamp = Math.floor(Date.now() / 1000);
    const stringToSign = `public_id=${public_id}&timestamp=${timestamp}${API_SECRET}`;
    
    // Generate a signature using `crypto-js`
    const signature = CryptoJS.SHA1(stringToSign).toString();

    const data = new FormData();
    data.append("public_id", public_id);
    data.append("api_key", API_KEY);
    data.append("timestamp", timestamp);
    data.append("signature", signature);

    try {
        const response = await fetch(url, {
            method: "POST",
            body: data
        });

        const result = await response.json();
        return result;
        
    } catch (error) {
        console.error("Cloudinary Delete Error:", error);
        return null;
    }
};
