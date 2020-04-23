const { db } = require("../utils/admin");

exports.getAllTasks = (req, res) => {
  db.collection("tasks")
    .where("userId", "==", req.user.uid)
    .orderBy("date", "desc")
    .get()
    .then((data) => {
      let tasks = [];
      data.forEach((doc) => {
        tasks.push({
          taskId: doc.id,
          projectId: doc.data().projectId,
          date: doc.data().date,
          archived: doc.data().archived,
          description: doc.data().description,
          userId: doc.data().userId,
        });
      });
      return res.status(200).json(tasks);
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ error: err.code });
    });
};

exports.addNewTask = (req, res) => {
  const newTask = {
    projectId: req.body.projectId,
    date: req.body.date || "",
    archived: false,
    description: req.body.description,
    userId: req.user.uid,
  };
  db.collection("tasks")
    .add(newTask)
    .then((doc) => {
      newTask.taskId = doc.id;
      res.status(201).json(newTask);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: "Something went wrong!" });
    });
};

// PROJECTS

exports.addNewProject = (req, res) => {
  const newProject = {
    name: req.body.name,
    userId: req.user.uid,
  };
  console.log(newProject);
  // eslint-disable-next-line promise/always-return
  db.collection("projects")
    .add(newProject)
    // eslint-disable-next-line promise/always-return
    .then((doc) => {
      newProject.projectId = doc.id;
      res.status(201).json(newProject);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: "Something went wrong!" });
    });
};

exports.getAllProjects = (req, res) => {
  // eslint-disable-next-line promise/always-return
  db.collection("projects")
    .where("userId", "==", req.user.uid)
    .get()
    // eslint-disable-next-line promise/always-return
    .then((data) => {
      let projects = [];
      data.forEach((doc) => {
        projects.push({
          projectId: doc.id,
          name: doc.data().name,
          userId: doc.data().userId,
        });
      });
      res.status(200).json(projects);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: "something went wrong!" });
    });
};

exports.archiveTaskToggle = (req, res) => {
  const document = db.doc(`/tasks/${req.params.taskId}`);
  document
    .get()
    .then((doc) => {
      if (!doc.exists) {
        return res.status(404).json({ error: "Task not found" });
      }
      if (doc.data().userId !== req.user.uid) {
        return res.status(403).json({ error: "Unauthorized" });
      } else {
        return document.update({ archived: !doc.data().archived });
      }
    })
    .then(() => {
      return res.json({ message: "task updated successfully" });
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ error: err.code });
    });
};

exports.deleteProject = (req, res) => {
  const document = db.doc(`/projects/${req.params.projectId}`);
  document
    .get()
    .then((doc) => {
      if (!doc.exists) {
        return res.status(404).json({ error: "Project not found" });
      }
      if (doc.data().userId !== req.user.uid) {
        return res.status(403).json({ error: "Unauthorized" });
      } else {
        return document.delete();
      }
    })
    .then(() => {
      res.json({ message: "project deleted successfully" });
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ error: err.code });
    });
};
