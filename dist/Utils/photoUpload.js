"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadImage = exports.upload = void 0;
const cloudinary_1 = require("cloudinary");
const multer_1 = __importDefault(require("multer")); // For parsing `multipart/form-data`
// Configure Cloudinary
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, // Replace with your Cloud Name
    api_key: process.env.CLOUDINARY_API_KEY, // Replace with your API Key
    api_secret: process.env.CLOUDINARY_API_SECRET // Replace with your API Secret
});
// Middleware for handling file uploads
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
exports.upload = upload;
const uploadImage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.file) {
            res.status(400).json({ message: "No file provided" });
            return;
        }
        // Get the folder name from client-side request
        const folderName = req.body.folderName || "default_folder"; // If no folder is provided, use "default_folder"
        // Upload the file to Cloudinary
        cloudinary_1.v2.uploader.upload_stream({ folder: folderName }, // Use the folder name provided by the client
        (error, result) => {
            if (error) {
                res.status(500).json({ message: "Failed to upload image", error });
            }
            else {
                res.status(200).json({ url: result === null || result === void 0 ? void 0 : result.secure_url });
            }
        }).end(req.file.buffer);
    }
    catch (error) {
        console.log("Error uploading image:", error);
        res.status(500).json({ message: "Internal server error", error });
    }
});
exports.uploadImage = uploadImage;
