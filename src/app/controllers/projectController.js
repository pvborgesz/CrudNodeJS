const express = require("express");
const authMiddleware = require("../middlewares/auth");
const router = express.Router();

const Project = require("../models/project");
const Task = require("../models/task");

router.use(authMiddleware);

router.get("/", async (req, res) => {
    try {
        const projects = await Project.find().populate(["user", "tasks"]);
        return res.send({ projects });
    } catch (err) {
        console.log(err)
        return res.status(400).send({ error: "error loading  projects" });
    };
});

router.get("/:projectId", async (req, res) => {
    try {
        const projects = await Project.findById(req.params.projectId).populate(["user", "tasks"]);
        return res.send({ projects });
    } catch (err) {
        console.log(err)
        return res.status(400).send({ error: "error loading  projects" });
    };
});

router.post("/", async (req, res) => {
    try {
        const { title, description, tasks } = req.body;

        const project = await Project.create({ title, description, user: req.userId });

        tasks.map(task => {
            const projectTask = new Task({ ...task, project: project._id });

            projectTask.save().then(task => {
                project.tasks.push(task);
            });
        })

        return res.send({ project });
    } catch (err) {
        return res.status(400).send({ error: "error creating new project" });
    }
    // res.send({ ok: true, user: req.userId })
});

router.put("/:projectId", async (req, res) => {
    try {
        const { title, description, tasks } = req.body;

        const project = await Project.findByIdAndUpdate(req.params.projectId,
            {
                title,
                description,
            }, { new: true });

        project.tasks = [];
        await Task.remove({ project: project._id });

        tasks.map(task => {
            const projectTask = new Task({ ...task, project: project._id });

            projectTask.save().then(task => {
                project.tasks.push(task);
            });
        })

        return res.send({ project });
    } catch (err) {
        return res.status(400).send({ error: "error updating project" });
    }
});

router.delete("/:projectId", async (req, res) => {
    try {
        await Project.findByIdAndRemove(req.params.projectId);
        return res.send();
    } catch (err) {
        console.log(err)
        return res.status(400).send({ error: "error deleting projects" });
    };;
});

module.exports = app => app.use("/projects", router);