import express from "express";
import {
	listCourses,
	getCourse,
	createCourse,
	updateCourse,
	deleteCourse,
} from "../Controllers/courseController.js";
import authMiddleware from "../Middlewears/authMiddlewear.js";
import authorizeRoles from "../Middlewears/authorizeRoles.js";

const router = express.Router();

router.get("/", listCourses);
router.get("/:courseId", getCourse);
router.post("/", authorizeRoles(["admin"]), createCourse);
router.put("/:courseId", authorizeRoles(["admin"]), updateCourse);
router.delete("/:courseId", authorizeRoles(["admin"]), deleteCourse);

export default router;
