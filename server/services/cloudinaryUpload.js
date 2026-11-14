const cloudinary = require("../config/cloudinary");

// Cloudinary folders used by the app.
const FOLDERS = {
    documents: "upi_tracker/documents",
    images: "upi_tracker/images"
};

/**
 * Upload a Buffer to Cloudinary using an upload stream.
 *
 * @param {Buffer} buffer - Raw file content (e.g. from multer memory storage).
 * @param {object} [options]
 * @param {"image"|"raw"|"video"} [options.resourceType="image"] - Cloudinary resource type.
 * @param {string} [options.folder] - Destination folder; defaults based on resource type.
 * @param {string} [options.fileName] - Optional display filename for raw uploads.
 * @returns {Promise<{url: string, publicId: string, format: string, bytes: number}>}
 */
const uploadToCloudinary = (buffer, options = {}) => {
    const resourceType = options.resourceType || "image";
    const folder = options.folder || (resourceType === "image" ? FOLDERS.images : FOLDERS.documents);

    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder,
                resource_type: resourceType,
                ...(options.fileName ? { public_id: options.fileName } : {})
            },
            (error, result) => {
                if (error) {
                    return reject(error);
                }
                if (!result) {
                    return reject(new Error("Cloudinary returned no result"));
                }

                resolve({
                    url: result.secure_url,
                    publicId: result.public_id,
                    format: result.format,
                    bytes: result.bytes
                });
            }
        );

        stream.end(buffer);
    });
};

/**
 * Pick the right Cloudinary resource type for a multer file.
 * Images -> "image", everything else (PDF, DOCX, etc.) -> "raw".
 *
 * @param {object} file - Multer file object.
 * @returns {"image"|"raw"}
 */
const resolveResourceType = (file) => {
    if (!file) {
        return "image";
    }
    return file.mimetype && file.mimetype.startsWith("image/") ? "image" : "raw";
};

module.exports = {
    uploadToCloudinary,
    resolveResourceType,
    FOLDERS
};
