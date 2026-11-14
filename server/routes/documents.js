const express = require("express");
const router = express.Router();
const multer = require("multer");
const { uploadToCloudinary, resolveResourceType } = require("../services/cloudinaryUpload");

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }
});

// Upload a document (image or raw file like PDF) to Cloudinary.
router.post("/upload", upload.single("document"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No document file provided" });
        }

        // "image" for images, "raw" for everything else (PDF, DOCX, etc.)
        const resourceType =
            req.body.resourceType === "raw"
                ? "raw"
                : resolveResourceType(req.file);

        const uploaded = await uploadToCloudinary(req.file.buffer, {
            resourceType,
            folder: "upi_tracker/documents"
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
