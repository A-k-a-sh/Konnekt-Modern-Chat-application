// Validate environment variables on app startup
export const validateEnv = () => {
    const errors = [];
    const warnings = [];

    // Required variables
    const required = {
        VITE_SOCKET_URL: import.meta.env.VITE_SOCKET_URL,
        VITE_CLOUDINARY_CLOUD_NAME: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
        VITE_CLOUDINARY_API_KEY: import.meta.env.VITE_CLOUDINARY_API_KEY,
        VITE_CLOUDINARY_API_SECRET: import.meta.env.VITE_CLOUDINARY_API_SECRET,
    };

    // Optional variables with defaults
    const optional = {
        VITE_CLOUDINARY_UPLOAD_PRESET: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'ChatAppMedia',
        VITE_CLOUDINARY_FOLDER: import.meta.env.VITE_CLOUDINARY_FOLDER || 'ChatApp',
    };

    // Check required variables
    for (const [key, value] of Object.entries(required)) {
        if (!value) {
            errors.push(`Missing required environment variable: ${key}`);
        }
    }

    // Check socket URL format
    if (required.VITE_SOCKET_URL) {
        try {
            new URL(required.VITE_SOCKET_URL);
        } catch (e) {
            errors.push(`Invalid VITE_SOCKET_URL format: ${required.VITE_SOCKET_URL}`);
        }
    }

    // Warn about optional variables using defaults
    for (const [key, value] of Object.entries(optional)) {
        if (!import.meta.env[key]) {
            warnings.push(`Using default value for ${key}: ${value}`);
        }
    }

    // Log results
    if (errors.length > 0) {
        console.error('❌ Environment validation failed:');
        errors.forEach(err => console.error(`  - ${err}`));
        throw new Error('Environment validation failed. Check console for details.');
    }

    if (warnings.length > 0 && import.meta.env.DEV) {
        console.warn('⚠️  Environment warnings:');
        warnings.forEach(warn => console.warn(`  - ${warn}`));
    }

    if (import.meta.env.DEV) {
        console.log('✅ Environment validation passed');
    }

    return {
        isValid: true,
        required,
        optional
    };
};

// Get all environment variables (for debugging)
export const getEnvVars = () => {
    return {
        SOCKET_URL: import.meta.env.VITE_SOCKET_URL,
        CLOUDINARY: {
            CLOUD_NAME: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
            API_KEY: import.meta.env.VITE_CLOUDINARY_API_KEY ? '***' : 'missing',
            API_SECRET: import.meta.env.VITE_CLOUDINARY_API_SECRET ? '***' : 'missing',
            UPLOAD_PRESET: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'ChatAppMedia',
            FOLDER: import.meta.env.VITE_CLOUDINARY_FOLDER || 'ChatApp',
        },
        MODE: import.meta.env.MODE,
        DEV: import.meta.env.DEV,
        PROD: import.meta.env.PROD,
    };
};
