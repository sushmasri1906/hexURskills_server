import express from "express";
import {
	fetchUsers,
	fetchCourses,
	assignTeacher,
	addCourse,
	updateCourse,
	removeCourse,
	updateTeacher,
	deleteTeacher,
	getAllTeachers,
	getTeacherById,
} from "../Controllers/adminController.js";
import authMiddleware from "../Middlewears/authMiddlewear.js";
import authorizeRoles from "../Middlewears/authorizeRoles.js";

const router = express.Router();

router.get("/users", authMiddleware, authorizeRoles(["admin"]), fetchUsers);
router.get("/course", authMiddleware, authorizeRoles(["admin"]), fetchCourses);
router.post(
	"/assign-teacher",
	authMiddleware,
	authorizeRoles(["admin"]),
	assignTeacher
);
router.post("/course", authMiddleware, authorizeRoles(["admin"]), addCourse);
router.put(
	"/course/:courseId",
	authMiddleware,
	authorizeRoles(["admin"]),
	updateCourse
);
router.delete(
	"/course/:courseId",
	authMiddleware,
	authorizeRoles(["admin"]),
	removeCourse
);
router.get("/teachers", getAllTeachers);
export default router;

// Get a specific teacher by ID
router.get("/teachers/:teacherId", getTeacherById);

// Update a specific teacher by ID
router.put(
	"/teachers/:teacherId",
	authMiddleware,
	authorizeRoles(["admin"]),
	updateTeacher
);

// Delete a specific teacher by ID
router.delete(
	"/teachers/:teacherId",
	authMiddleware,
	authorizeRoles(["admin"]),
	deleteTeacher
);
