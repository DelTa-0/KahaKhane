module.exports.APP_CONFIG = {
    MONGO_URI:process.env.MONGO_URI || ''
};

module.exports.ORDER_STATUS = {
    PENDING:"pending",
    COMPLETED:"completed",
    CANCELLED:"cancelled"
}