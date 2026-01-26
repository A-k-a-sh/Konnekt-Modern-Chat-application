import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({
            error: error,
            errorInfo: errorInfo
        });
        
        // Log error to console in development
        if (import.meta.env.DEV) {
            console.error('Error caught by boundary:', error, errorInfo);
        }
        
        // TODO: Log to error reporting service in production
        // Example: logErrorToService(error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
                    <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
                        <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
                            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
                            Oops! Something went wrong
                        </h2>
                        <p className="text-gray-600 text-center mb-6">
                            We're sorry for the inconvenience. Please try refreshing the page.
                        </p>
                        
                        {import.meta.env.DEV && this.state.error && (
                            <details className="mb-4">
                                <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800 mb-2">
                                    Show error details (dev only)
                                </summary>
                                <div className="bg-gray-50 rounded p-3 text-xs font-mono text-red-600 overflow-auto max-h-40">
                                    <div className="font-bold mb-2">{this.state.error.toString()}</div>
                                    <div className="text-gray-700 whitespace-pre-wrap">
                                        {this.state.errorInfo?.componentStack}
                                    </div>
                                </div>
                            </details>
                        )}
                        
                        <button
                            onClick={() => window.location.reload()}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200"
                        >
                            Refresh Page
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
