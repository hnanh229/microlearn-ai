/**
 * Utility functions for uploading images to Cloudinary
 */

/**
 * Upload an image file to Cloudinary
 * @param {File} file - The image file to upload
 * @returns {Promise<string>} The URL of the uploaded image
 */
export const uploadImageToCloudinary = async (file) => {
    if (!file) return null;

    try {
        // Create form data for image upload
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);

        // Upload to Cloudinary
        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
            {
                method: 'POST',
                body: formData,
            }
        );

        if (!response.ok) {
            throw new Error('Failed to upload image');
        }

        const data = await response.json();

        if (data.secure_url) {
            return data.secure_url;
        } else {
            throw new Error('Failed to upload image');
        }
    } catch (err) {
        console.error('Error uploading image:', err);
        throw new Error('Image upload failed. Please try again.');
    }
};

/**
 * Validate image file before upload
 * @param {File} file - The image file to validate
 * @param {number} maxSizeInMB - Maximum allowed file size in MB
 * @returns {string|null} Error message if validation fails, null if validation passes
 */
export const validateImageFile = (file, maxSizeInMB = 2) => {
    if (!file) return 'No file selected';

    // Check file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
        return 'Invalid file type. Please upload a JPEG, PNG, GIF, or WEBP image.';
    }

    // Check file size (convert MB to bytes)
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
        return `File size must be less than ${maxSizeInMB}MB`;
    }

    return null;
};
