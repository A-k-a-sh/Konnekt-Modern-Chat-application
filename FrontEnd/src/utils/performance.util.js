// Performance optimization utilities

/**
 * Debounce function for expensive operations
 * @param {Function} func - Function to debounce
 * @param {number} wait - Milliseconds to wait
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait = 300) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

/**
 * Throttle function for rate-limiting
 * @param {Function} func - Function to throttle
 * @param {number} limit - Milliseconds to throttle
 * @returns {Function} Throttled function
 */
export const throttle = (func, limit = 300) => {
    let inThrottle;
    return function executedFunction(...args) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};

/**
 * Check if two objects are shallowly equal
 * Useful for React.memo comparison functions
 */
export const shallowEqual = (obj1, obj2) => {
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    if (keys1.length !== keys2.length) {
        return false;
    }

    for (let key of keys1) {
        if (obj1[key] !== obj2[key]) {
            return false;
        }
    }

    return true;
};

/**
 * Deep comparison for arrays (useful for message arrays)
 */
export const deepEqual = (arr1, arr2) => {
    if (arr1.length !== arr2.length) return false;
    return arr1.every((item, index) => {
        if (typeof item === 'object' && item !== null) {
            return JSON.stringify(item) === JSON.stringify(arr2[index]);
        }
        return item === arr2[index];
    });
};

/**
 * Lazy load image with intersection observer
 * @param {string} src - Image source
 * @param {HTMLElement} element - Image element
 */
export const lazyLoadImage = (src, element) => {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                element.src = src;
                observer.unobserve(element);
            }
        });
    });
    observer.observe(element);
    return () => observer.disconnect();
};

/**
 * Batch state updates to reduce re-renders
 * @param {Function[]} updates - Array of state update functions
 */
export const batchUpdates = (updates) => {
    // React 18+ automatically batches updates
    // This is a compatibility wrapper for older versions
    if (typeof React !== 'undefined' && React.unstable_batchedUpdates) {
        React.unstable_batchedUpdates(() => {
            updates.forEach(update => update());
        });
    } else {
        updates.forEach(update => update());
    }
};

/**
 * Memoize expensive computations
 * @param {Function} fn - Function to memoize
 * @returns {Function} Memoized function
 */
export const memoize = (fn) => {
    const cache = new Map();
    return (...args) => {
        const key = JSON.stringify(args);
        if (cache.has(key)) {
            return cache.get(key);
        }
        const result = fn(...args);
        cache.set(key, result);
        return result;
    };
};
