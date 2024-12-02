import { Request, Response } from "express";
import { v2 as cloudinary } from "cloudinary";
import multer from "multer"; // For parsing `multipart/form-data`

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, // Replace with your Cloud Name
  api_key: process.env.CLOUDINARY_API_KEY,      // Replace with your API Key
  api_secret: process.env.CLOUDINARY_API_SECRET // Replace with your API Secret
});

// Middleware for handling file uploads
const upload = multer({ storage: multer.memoryStorage() });

const uploadImage = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ message: "No file provided" });
      return;
    }

    // Get the folder name from client-side request
    const folderName = req.body.folderName || "default_folder"; // If no folder is provided, use "default_folder"

    // Upload the file to Cloudinary
    cloudinary.uploader.upload_stream(
      { folder: folderName }, // Use the folder name provided by the client
      (error, result) => {
        if (error) {
          res.status(500).json({ message: "Failed to upload image", error });
        } else {
          res.status(200).json({ url: result?.secure_url });
        }
      }
    ).end(req.file.buffer);
  } catch (error) {
    console.log("Error uploading image:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

export { upload, uploadImage };
