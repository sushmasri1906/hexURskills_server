import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import userRoutes from "./Routes/userRoutes.js";
import authRoutes from "./Routes/authRoutes.js";
import teacherRoutes from "./Routes/teacherRoutes.js";
import adminRoutes from "./Routes/adminRoutes.js";
import courseRoutes from "./Routes/courseRoutes.js";
import authMiddleware from "./Middlewears/authMiddlewear.js";
import authorizeRoles from "./Middlewears/authorizeRoles.js";

dotenv.config();
const app = express();
const port = process.env.PORT || 3001;

const MONGO_URI = process.env.MONGO_URI;
mongoose
	.connect(MONGO_URI)
	.then(() => console.log("Connected to MongoDB"))
	.catch((err) => console.log(err));

app.use(express.json());
app.use(cors());

//authroutes
app.use("/api/auth", authRoutes);

//protected routes
app.use("/api/users", userRoutes);
app.use("/api/course", authMiddleware, courseRoutes);

//role-based protected routes
app.use(
	"/api/teacher",
	authMiddleware,
	authorizeRoles(["teacher", "admin"]),
	teacherRoutes
);

app.use("/api/admin", authMiddleware, authorizeRoles(["admin"]), adminRoutes);

app.listen(port, (req, res) => {
	console.log(`Server is running on port ${port}`);
});
