const cloudinary = require('./cloudinary');

/**
 * Upload an image to Cloudinary
 * @param {string} imagePath - The path to the image (can be a URL or file path)
 * @param {Object} options - Upload options
 * @returns {Promise<Object>} - Cloudinary upload result
 */
const uploadImage = async (imagePath, options = {}) => {
    try {
        // Set default folder if not provided
        const uploadOptions = {
            folder: 'microlearn',
            ...options,
        };

        // Upload the image to Cloudinary
        const result = await cloudinary.uploader.upload(imagePath, uploadOptions);
        return result;
    } catch (error) {
        console.error('Error uploading image to Cloudinary:', error);
        throw new Error('Failed to upload image');
    }
};

/**
 * Delete an image from Cloudinary
 * @param {string} publicId - The public ID of the image to delete
 * @returns {Promise<Object>} - Cloudinary deletion result
 */
const deleteImage = async (publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        return result;
    } catch (error) {
        console.error('Error deleting image from Cloudinary:', error);
        throw new Error('Failed to delete image');
    }
};

module.exports = {
    uploadImage,
    deleteImage,
};
