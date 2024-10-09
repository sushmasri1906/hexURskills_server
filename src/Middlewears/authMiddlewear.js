import jwt from "jsonwebtoken";
import User from "../Models/userModel.js";

const authMiddleware = async (req, res, next) => {
	const token = req.headers.authorization?.split(" ")[1];
	if (!token) {
		return res.status(401).json({ message: "No token" });
	}

	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		const user = await User.findById(decoded.id);

		if (!user) {
			return res.status(401).json({ message: "User not found" });
		}

		req.user = user;
		next();
	} catch (error) {
		res.status(401).json({ message: "Invalid token" });
	}
};

export default authMiddleware;
