import jwt from "jsonwebtoken";
import dotenv from "dotenv";

const verifyToken = (token) => {
	dotenv.config();

	try {
		console.log(process.env.JWT_SECRET);
		return jwt.verify(token, process.env.JWT_SECRET);
	} catch (error) {
		return null;
	}
};

export default verifyToken;
