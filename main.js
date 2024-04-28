import express from "express";
import mongoose from "mongoose";
import path from "path";
import {fileURLToPath} from "url";
import userRoutes from "./routes/userRoutes.js";
import blogRoutes from "./routes/blogRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";

const main = express();
const port = 3000;
const __fileName = fileURLToPath(import.meta.url); //get resolved path fo file
const __dirName = path.dirname(__fileName); //get name of directory

main.use(express.json());
mongoose.connect("mongodb://localhost:27017/ist256_project02", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    autoCreate: true,
}).then(() => {
    console.log("MongoDB Connected!")}).catch((error) => {
        console.log("Error connecting to MongoDB", error);
});

main.use("/users", userRoutes);
main.use("/posts", blogRoutes);
main.use("/comments", commentRoutes);

//Serve static files from frontend directory & set content types for .js files
main.use(express.static(path.join(__dirName, "frontend"), {
    setHeaders: (res, filePath) => {
        if (filePath.endsWith(".js")) {
            res.setHeader("Content-Type", "application/javascript");
        }
    }
}));

//Homepage Route Definition
main.get("/", (req, res) => {
    res.sendFile(path.join(__dirName, "frontend/index.html"));
});

main.listen(port, () => {
    console.log("Server is running on port: " + port);
});