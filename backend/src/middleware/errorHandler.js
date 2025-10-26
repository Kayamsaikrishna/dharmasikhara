const errorHandler = (err, req, res, next) => {
    console.error('Unhandled error:', err);
    
    // Determine the response status code
    const statusCode = err.statusCode || 500;
    
    // Determine the response message
    const message = err.message || 'Internal Server Error';
    
    // Send the error response
    res.status(statusCode).json({
        success: false,
        message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

module.exports = errorHandler;