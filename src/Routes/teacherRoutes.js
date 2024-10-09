import express from "express";
import {
	getTeacherCourses,
	getCourseStudents,
} from "../Controllers/teacherController.js";

const router = express.Router();
// Get courses assigned to the logged-in teacher
router.get("/course", getTeacherCourses);

// Get students in a specific course
router.get("/course/:courseId/students", getCourseStudents);

export default router;
