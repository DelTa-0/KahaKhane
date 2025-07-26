module.exports.APP_CONFIG = {
    MONGO_URI:process.env.MONGO_URI || '',
    PORT:process.env.PORT || 3000,
    SESSION_SECRET: process.env.SESSION_SECRET
};

module.exports.ORDER_STATUS = {
    PENDING:"pending",
    COMPLETED:"completed",
    CANCELLED:"cancelled"
}