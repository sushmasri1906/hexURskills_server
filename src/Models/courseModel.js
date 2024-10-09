import mongoose from "mongoose";

const CourseSchema = new mongoose.Schema({
	title: { type: String, unique: true, required: true },
	description: { type: String },
	teacher: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
	},
	students: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
	price: { type: String, default: 0, required: true },
	featured: { type: Boolean, default: false },
	popular: { type: Number, default: 0 },
	duration: { type: String, default: "0h" },
});

const Course = mongoose.model("Course", CourseSchema);

export default Course;
