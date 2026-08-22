import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../utils/cloudinary.js";

const attachmentStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "collabsphere/attachments",
        resource_type: "auto",
    },
});

export const upload = multer({
    storage: attachmentStorage,
    limits: {
        fileSize: 1 * 1000 * 1000,
    },
});

const avatarStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "collabsphere/avatars",
        resource_type: "image",
        format: "jpg",
        transformation: [{ width: 200, height: 200, crop: "fill", gravity: "face" }],
    },
});

export const uploadAvatar = multer({
    storage: avatarStorage,
    limits: {
        fileSize: 1 * 1000 * 1000,
    },
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith("image/")) {
            return cb(new Error("Avatar must be an image file"));
        }
        cb(null, true);
    },
});