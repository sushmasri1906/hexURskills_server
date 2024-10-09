import Course from "../Models/courseModel.js";
import User from "../Models/userModel.js";
import mongoose from "mongoose";

// Update student profile
export const getProfile = async (req, res) => {
	const studentId = req.user._id;

	try {
		// Find the student by ID
		const student = await User.findById(studentId);

		// If student not found, return 404
		if (!student) {
			return res.status(404).json({ message: "User not found" });
		}

		// Return the updated student profile
		res.status(200).json({
			message: "Got Profile successfully",
			profile: student,
		});
	} catch (err) {
		console.error("Error updating profile:", err);
		res.status(500).json({ error: "Failed to update profile" });
	}
};

// Enroll student in a course using a transaction
export const enrollInCourse = async (req, res) => {
	const studentId = req.user._id;
	const { courseId } = req.body; // Get course ID from request body

	const session = await mongoose.startSession(); // Start a Mongoose session
	session.startTransaction(); // Start the transaction

	try {
		// Find the course by ID
		const course = await Course.findById(courseId).session(session);

		if (!course) {
			return res.status(404).json({ message: "Course not found" });
		}

		// Check if the student is already enrolled
		const isAlreadyEnrolled = course.students.includes(studentId);
		if (isAlreadyEnrolled) {
			return res
				.status(400)
				.json({ message: "Student is already enrolled in this course" });
		}

		// Add the course to the student's list of enrolled courses
		await User.findByIdAndUpdate(
			studentId,
			{ $addToSet: { courses: courseId } },
			{ session }
		);

		// Add the student to the course's list of enrolled students
		await Course.findByIdAndUpdate(
			courseId,
			{ $addToSet: { students: studentId } },
			{ session }
		);

		// Commit the transaction
		await session.commitTransaction();
		session.endSession();

		res.status(200).json({ message: "Enrolled in course successfully" });
	} catch (error) {
		// If there's an error, abort the transaction
		await session.abortTransaction();
		session.endSession();

		console.error("Error enrolling in course:", error);
		res.status(500).json({ error: "Failed to enroll in course" });
	}
};

// Get courses a student is enrolled in
export const getEnrolledCourses = async (req, res) => {
	const studentId = req.user._id;
	try {
		// Find the student and populate their enrolled courses
		const student = await User.findById(studentId);

		// If student not found, return 404
		if (!student) {
			return res.status(404).json({ message: "Student not found" });
		}

		const courses = await Course.find({ _id: { $in: student.courses } });

		// Return enrolled courses
		res.status(200).json({ courses });
	} catch (err) {
		console.error("Error fetching enrolled courses:", err);
		res.status(500).json({ error: "Failed to fetch enrolled courses" });
	}
};

// Update student profile
export const updateProfile = async (req, res) => {
	const studentId = req.user._id;
	const { firstName, lastName, bio } = req.body;

	try {
		// Find the student by ID
		const student = await User.findById(studentId);

		// If student not found, return 404
		if (!student) {
			return res.status(404).json({ message: "User not found" });
		}

		// Update fields dynamically
		if (firstName !== undefined) student.profile.firstName = firstName;
		if (lastName !== undefined) student.profile.lastName = lastName;
		if (bio !== undefined) student.profile.bio = bio;

		// Save the updated profile
		await student.save();

		// Return the updated student profile
		res.status(200).json({
			message: "Profile updated successfully",
			profile: {
				firstName: student.profile.firstName,
				lastName: student.profile.lastName,
				bio: student.profile.bio,
			},
		});
	} catch (err) {
		console.error("Error updating profile:", err);
		res.status(500).json({ error: "Failed to update profile" });
	}
};
