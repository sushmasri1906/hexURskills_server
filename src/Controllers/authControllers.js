import User from "../Models/userModel.js";
import generateToken from "../Utils/generateToken.js";
import hashPassword from "../Utils/hashPassword.js";
import bcrypt from "bcrypt";
import verifyToken from "../Utils/tokenVerify.js";

// Register a new user
export const register = async (req, res) => {
	const { username, email, password, role } = req.body;

	try {
		// Check if the user already exists
		const existingUser = await User.findOne({ $or: [{ email }, { username }] });
		if (existingUser) {
			return res
				.status(400)
				.json({ message: "User already exists with that email or username" });
		}

		// Hash the password using the utility function
		const hashedPassword = await hashPassword(password);

		// Create and save new user
		const newUser = new User({
			username,
			email,
			password: hashedPassword,
			role, // 'admin', 'teacher', or 'student'
		});

		await newUser.save();

		// Generate JWT token using the utility function

		res.status(201).json({ message: "User registered successfully" });
	} catch (error) {
		res
			.status(500)
			.json({ message: "Error registering user", error: error.message });
	}
};

// Login a user
export const login = async (req, res) => {
	const { email, password } = req.body;

	try {
		// Check if user exists
		const user = await User.findOne({ email });
		if (!user) {
			return res.status(400).json({ message: "User not found" });
		}

		// Compare password using bcrypt
		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch) {
			return res.status(400).json({ message: "Invalid credentials" });
		}

		// Generate JWT token using the utility function
		const token = generateToken(user._id);

		res.status(200).json({
			message: "Login successful",
			data: { token, role: user.role, user },
		});
	} catch (error) {
		res.status(500).json({ message: "Error logging in", error: error.message });
	}
};
