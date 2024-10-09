import Course from "../Models/courseModel.js";
import User from "../Models/userModel.js";

// Get all courses
export const listCourses = async (req, res) => {
	try {
		const courses = await Course.find()
			.populate("teacher")
			.populate("students");
		res.json(courses);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

// Get a specific course
export const getCourse = async (req, res) => {
	const { courseId } = req.params;
	try {
		const course = await Course.findById(courseId)
			.populate("teacher")
			.populate("students");
		if (!course) {
			return res.status(404).json({ message: "Course not found" });
		}
		res.json(course);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

// Create a new course
export const createCourse = async (req, res) => {
	console.log("working");
	const { title, description } = req.body;
	try {
		console.log(title);
		console.log(description);
		const course = new Course({
			title,
			description,
		});
		await course.save();

		// const teacher = await User.findById(teacherId);
		// teacher.courses.push(course._id);
		// await teacher.save();

		// await User.updateMany(
		// 	{ _id: { $in: studentIds } },
		// 	{ $push: { courses: course._id } }
		// );

		res.status(201).json({ message: "Course created", course });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

// Update an existing course
export const updateCourse = async (req, res) => {
	const { courseId } = req.params;
	const { title, description, teacherId, studentIds } = req.body;
	try {
		const course = await Course.findById(courseId);
		if (!course) {
			return res.status(404).json({ message: "Course not found" });
		}

		course.title = title || course.title;
		course.description = description || course.description;
		course.teacher = teacherId || course.teacher;
		course.students = studentIds || course.students;

		await course.save();

		res.json({ message: "Course updated", course });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

// Delete a course
export const deleteCourse = async (req, res) => {
	const { courseId } = req.params;
	try {
		const course = await Course.findByIdAndDelete(courseId);
		if (!course) {
			return res.status(404).json({ message: "Course not found" });
		}

		await User.updateMany(
			{ _id: { $in: course.students } },
			{ $pull: { courses: courseId } }
		);
		const teacher = await User.findById(course.teacher);
		if (teacher) {
			teacher.courses.pull(courseId);
			await teacher.save();
		}

		res.json({ message: "Course deleted" });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};
