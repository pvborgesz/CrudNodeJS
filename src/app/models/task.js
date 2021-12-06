const mongoose = require("../../database/connection");
const bcrypt = require("bcryptjs")


const TaskSchema = new mongoose.Schema({
    title: {
        type: String,
        require: true,
    },
    project: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "Project",
        require: true,
    },
    description: {
        type: String,
        require: true,
    },
    assignedTo: {
        type: mongoose.SchemaTypes.ObjectId, //forma que o mongo guarda o id 
        ref: "User",
        require: true,
    },
    completed: {
        type: Boolean,
        require: true,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});


const Task = mongoose.model("Task", TaskSchema);

module.exports = Task;