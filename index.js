const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");
// Local imports
const firebaseAuth = require("./utils/firebaseAuth");
const {
  addNewProject,
  addNewTask,
  getAllProjects,
  getAllTasks,
  deleteProject,
  archiveTaskToggle,
} = require("./handlers/tasks");
const { signup, login } = require("./handlers/users");
const { db } = require("./utils/admin");

// Initialize app
const app = express();
app.use(cors());

// ROUTES
// Task routes
app.get("/tasks", firebaseAuth, getAllTasks);
app.post("/task", firebaseAuth, addNewTask);
app.get("/tasks/:taskId/archive", firebaseAuth, archiveTaskToggle);

// Project Routes
app.get("/projects", firebaseAuth, getAllProjects);
app.post("/project", firebaseAuth, addNewProject);
app.delete("/projects/:projectId", firebaseAuth, deleteProject);

// Authentication routes
app.post("/signup", signup);
app.post("/login", login);

exports.api = functions.region("asia-east2").https.onRequest(app);

exports.onProjectDelete = functions
  .region("asia-east2")
  .firestore.document("/projects/{projectId}")
  .onDelete((_, context) => {
    const projectId = context.params.projectId;
    const batch = db.batch();

    return db
      .collection("/tasks/")
      .where("projectId", "==", projectId)
      .get()
      .then((data) => {
        data.forEach((doc) => {
          batch.delete(db.doc(`/tasks/${doc.id}`));
        });
        return batch.commit();
      })
      .catch((err) => console.error(err));
  });
