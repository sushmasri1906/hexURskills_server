import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
	{
		username: { type: String, required: true, unique: true },
		email: { type: String, required: true, unique: true },
		password: { type: String, required: true },
		role: {
			type: String,
			enum: ["admin", "teacher", "student"], // Correct enum definition
			required: true, // Optional: Ensure role is always specified
		},
		courses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
	},
	{ discriminatorKey: "role", collection: "users" }
);

const User = mongoose.model("User", UserSchema);

export default User;
