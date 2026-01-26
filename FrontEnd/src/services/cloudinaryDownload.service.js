/**
 * Converts a Cloudinary raw file URL to a download URL
 * This fixes the "untrusted customer" error by using fl_attachment flag
 * 
 * @param {string} url - The original Cloudinary URL
 * @param {string} fileName - The file name for download
 * @returns {string} - Modified URL with download transformation
 */
export const getCloudinaryDownloadUrl = (url, fileName) => {
    // Check if it's a Cloudinary URL
    if (!url.includes('cloudinary.com')) {
        return url;
    }

    // Extract the public_id and other parts from the URL
    // URL format: https://res.cloudinary.com/[cloud_name]/[resource_type]/upload/[version]/[public_id].[ext]

    // For raw files, add fl_attachment transformation to force download
    // This bypasses the "untrusted customer" restriction

    const urlParts = url.split('/upload/');
    if (urlParts.length === 2) {
        // Add transformation flags
        const transformation = `fl_attachment:${encodeURIComponent(fileName)}`;
        const newUrl = `${urlParts[0]}/upload/${transformation}/${urlParts[1]}`;
        return newUrl;
    }

    return url;
};

/**
 * Alternative: Get a simple download URL without filename
 */
export const getSimpleDownloadUrl = (url) => {
    if (!url.includes('cloudinary.com')) {
        return url;
    }

    const urlParts = url.split('/upload/');
    if (urlParts.length === 2) {
        const transformation = 'fl_attachment';
        const newUrl = `${urlParts[0]}/upload/${transformation}/${urlParts[1]}`;
        return newUrl;
    }

    return url;
};
