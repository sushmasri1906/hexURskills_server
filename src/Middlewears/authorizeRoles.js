import jwt from "jsonwebtoken";
import User from "../Models/userModel.js";

const authorizeRoles = (roles) => {
	return async (req, res, next) => {
		const token = req.headers.authorization?.split(" ")[1]; // Extract the token

		if (!token) {
			return res.status(401).json({ message: "No token provided" });
		}

		try {
			// Verify token
			const decoded = jwt.verify(token, process.env.JWT_SECRET);

			// Fetch user from database
			const user = await User.findById(decoded.id);

			// Check if the user exists and if the role matches
			if (!user) {
				return res.status(404).json({ message: "User not found" });
			}
			if (!roles.includes(user.role)) {
				return res
					.status(403)
					.json({ message: "Access denied. Insufficient permissions." });
			}

			// Store user info in request object for future use
			req.user = user;
			next(); // Allow access
		} catch (error) {
			return res.status(401).json({ message: "Invalid or expired token" });
		}
	};
};

export default authorizeRoles;
