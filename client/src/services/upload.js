import api from "./api";

/**
 * Upload a document (image or PDF) to Cloudinary via the backend.
 *
 * @param {File} file - The file selected by the user (from an <input type="file" />).
 * @param {string} [resourceType] - Optional Cloudinary resource type override
 *                                  ("image", "video", or "raw" for arbitrary docs).
 * @returns {Promise<{message: string, url: string, publicId: string}>}
 */
export const uploadDocument = async (file, resourceType = "image") => {
    if (!file) {
        throw new Error("No file provided");
    }

    const formData = new FormData();
    formData.append("document", file);
    if (resourceType) {
        formData.append("resourceType", resourceType);
    }

    const response = await api.post("/documents/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 60000
    });

    return response.data;
};

export default uploadDocument;
