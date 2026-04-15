import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const generateToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
};

const verifyToken = (token) => {
    return jwt.verify(token, process.env.JWT_SECRET);
};

export { generateToken, verifyToken };
