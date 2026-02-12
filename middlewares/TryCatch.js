const TryCatch = (handler) => {
    return async (req, res, next) => {
        try {
            await handler(req, res, next);
        } catch (error) {
            console.error("Error in TryCatch middleware:", error);
            res.status(500).json({ message: "Internal Server Error" });
        }   
    };
}       




export default TryCatch;