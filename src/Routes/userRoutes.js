import express from "express";
import {
	getEnrolledCourses,
	enrollInCourse,
	getProfile,
	updateProfile,
} from "../Controllers/userController.js";
import authMiddleware from "../Middlewears/authMiddlewear.js";
import authorizeRoles from "../Middlewears/authorizeRoles.js";

const router = express.Router();

router.get(
	"/course",
	authMiddleware,
	authorizeRoles(["student"]),
	getEnrolledCourses
);

router.post(
	"/course",
	authMiddleware,
	authorizeRoles(["student"]),
	enrollInCourse
);

router.put(
	"/profile",
	authMiddleware,
	authorizeRoles(["student"]),

	updateProfile
);

router.get("/", authMiddleware, authorizeRoles(["student"]), getProfile);

export default router;
