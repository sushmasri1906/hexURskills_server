import User from "../Models/userModel.js";
import Course from "../Models/courseModel.js";

// Get students in a course
export const getCourseStudents = async (req, res) => {
	const { courseId } = req.params;
	if (!courseId) {
		return res.status(400).json({ message: "Course ID is required" });
	}
	try {
		const course = await Course.findById(courseId).populate("students");
		if (!course) {
			return res.status(404).json({ message: "Course not found" });
		}
		if (!course.students.length) {
			return res
				.status(404)
				.json({ message: "No students found in this course" });
		}
		res.json({ students: course.students });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

// Get courses for the logged-in teacher
export const getTeacherCourses = async (req, res) => {
	const teacherId = req.user._id; // Get the teacher's ID from the authenticated user

	try {
		// Find the teacher by ID and populate the courses
		const teacher = await User.findById(teacherId).populate("courses");
		if (!teacher) {
			return res.status(404).json({ message: "Teacher not found" });
		}

		// Return the enrolled courses
		return res.status(200).json({ courses: teacher.courses });
	} catch (err) {
		console.error("Error fetching teacher's courses:", err);
		return res.status(500).json({ error: err.message });
	}
};
