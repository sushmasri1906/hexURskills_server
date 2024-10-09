import User from "../Models/userModel.js";
import Course from "../Models/courseModel.js";
import mongoose from "mongoose";

// Get all users (including admin)
export const fetchUsers = async (req, res) => {
	try {
		const users = await user.find().populate("courses");
		res.status(200).json(users);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

// Get all courses
export const fetchCourses = async (req, res) => {
	try {
		const courses = await Course.find()
			.populate("teacher", "username email")
			.populate("students", "username email");
		res.status(200).json(courses);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

export const assignTeacher = async (req, res) => {
	const { courseId, teacherId } = req.body;

	// Check for missing fields
	if (!courseId || !teacherId) {
		return res
			.status(400)
			.json({ message: "Course ID and Teacher ID are required." });
	}

	let session;
	try {
		// Start a session for atomic transactions
		session = await mongoose.startSession();
		session.startTransaction();

		// Fetch both course and teacher in parallel
		const [course, teacher] = await Promise.all([
			Course.findById(courseId).session(session),
			User.findById(teacherId).session(session),
		]);

		// Handle if course or teacher is not found
		if (!course) {
			await session.abortTransaction();
			return res.status(404).json({ message: "Course not found." });
		}
		if (!teacher) {
			await session.abortTransaction();
			return res.status(404).json({ message: "Teacher not found." });
		}

		// Ensure the user is a teacher
		if (teacher.role !== "teacher") {
			await session.abortTransaction();
			return res
				.status(400)
				.json({ message: "Assigned user is not a teacher." });
		}

		// Assign the teacher to the course
		course.teacher = teacherId;

		// Add course to the teacher's list if not already enrolled
		if (!teacher.courses.includes(courseId)) {
			teacher.courses.push(courseId);
		}

		// Save both course and teacher in parallel
		await Promise.all([course.save({ session }), teacher.save({ session })]);

		// Commit the transaction
		await session.commitTransaction();
		return res
			.status(200)
			.json({ message: "Teacher successfully assigned to course." });
	} catch (err) {
		// Abort transaction and log error
		if (session && session.inTransaction()) {
			// Check if session is active
			await session.abortTransaction();
		}
		console.error("Error assigning teacher to course:", err.message);
		return res
			.status(500)
			.json({ error: "Failed to assign teacher to course." });
	} finally {
		// Ensure session is ended
		if (session) {
			session.endSession();
		}
	}
};

// Create a course
export const addCourse = async (req, res) => {
	console.log("Working");
	const { title, description = "", teacherId = "", studentIds = "" } = req.body;
	try {
		const course = new Course({
			title,
			description,
			teacher: teacherId,
			students: studentIds,
		});
		await course.save();

		const teacher = await user.findById(teacherId);
		if (teacher) {
			teacher.courses.push(course._id);
			await teacher.save();
		}

		await user.updateMany(
			{ _id: { $in: studentIds } },
			{ $push: { courses: course._id } }
		);

		res.status(201).json({ message: "Course created", course });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

// Update a course
export const updateCourse = async (req, res) => {
	const { courseId } = req.params;
	const { title, description, teacherId, studentId } = req.body;

	try {
		const course = await Course.findById(courseId);
		if (!course) {
			return res.status(404).json({ message: "Course not found" });
		}

		course.title = title || course.title;
		course.description = description || course.description;
		course.teacher = teacherId || course.teacher;
		course.students = studentId || course.students;

		await course.save();

		res.status(200).json({ message: "Course updated", course });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

// Delete a course
export const removeCourse = async (req, res) => {
	const { courseId } = req.params;

	try {
		const course = await Course.findByIdAndDelete(courseId);
		if (!course) {
			return res.status(404).json({ message: "Course not found" });
		}

		await user.updateMany(
			{ _id: { $in: course.students } },
			{ $pull: { courses: courseId } }
		);
		const teacher = await user.findById(course.teacher);
		if (teacher) {
			teacher.courses.pull(courseId);
			await teacher.save();
		}

		res.status(200).json({ message: "Course deleted successfully" });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

// Get all teachers
export const getAllTeachers = async (req, res) => {
	try {
		const teachers = await User.find({ role: "teacher" });
		if (!teachers.length) {
			return res.status(404).json({ message: "No teachers found" });
		}
		res.json({ teachers });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

// Get a specific teacher by ID
export const getTeacherById = async (req, res) => {
	const { teacherId } = req.params;
	try {
		const teacher = await User.findById(teacherId);
		if (!teacher) {
			return res.status(404).json({ message: "Teacher not found" });
		}
		res.json({ teacher });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

// Update a specific teacher by ID
export const updateTeacher = async (req, res) => {
	const { teacherId } = req.params;
	const updateData = req.body;
	try {
		const updatedTeacher = await User.findByIdAndUpdate(teacherId, updateData, {
			new: true,
		});
		if (!updatedTeacher) {
			return res.status(404).json({ message: "Teacher not found" });
		}
		res.json({ teacher: updatedTeacher });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

// Delete a specific teacher by ID
export const deleteTeacher = async (req, res) => {
	const { teacherId } = req.params;
	try {
		const deletedTeacher = await User.findByIdAndDelete(teacherId);
		if (!deletedTeacher) {
			return res.status(404).json({ message: "Teacher not found" });
		}
		res.json({ message: "Teacher deleted successfully" });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};
