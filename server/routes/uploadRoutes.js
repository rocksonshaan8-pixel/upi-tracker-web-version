const express = require("express");
const router = express.Router();
const multer = require("multer");
const { uploadToCloudinary, resolveResourceType, FOLDERS } = require("../services/cloudinaryUpload");

// Accept files up to 10 MB, kept in memory for a direct Cloudinary stream.
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }
});

// Field name "file": images go to the images folder, everything else to documents.
router.post("/image", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file provided" });
        }

        if (!req.file.mimetype.startsWith("image/")) {
            return res.status(400).json({ message: "Only image files are allowed" });
        }

        const uploaded = await uploadToCloudinary(req.file.buffer, {
            resourceType: "image",
            folder: FOLDERS.images
        });

        return res.status(201).json({
            message: "Image uploaded successfully",
            url: uploaded.url,
            publicId: uploaded.publicId
        });
    } catch (error) {
        console.error("Image upload error:", error);

        return res.status(500).json({
            message: "Failed to upload image"
        });
    }
});

// Field name "file": any document type (PDF, DOCX, images, etc.).
router.post("/document", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file provided" });
        }

        const uploaded = await uploadToCloudinary(req.file.buffer, {
            resourceType: resolveResourceType(req.file),
            folder: FOLDERS.documents
        });

        return res.status(201).json({
            message: "Document uploaded successfully",
            url: uploaded.url,
            publicId: uploaded.publicId
        });
    } catch (error) {
        console.error("Document upload error:", error);

        return res.status(500).json({
            message: "Failed to upload document"
        });
    }
});

module.exports = router;
