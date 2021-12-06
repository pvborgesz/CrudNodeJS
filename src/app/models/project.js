const mongoose = require("../../database/connection");
const bcrypt = require("bcryptjs")


const ProjectSchema = new mongoose.Schema({
    title: {
        type: String,
        require: true,
    },
    description: {
        type: String,
        require: true,
    },
    user: {
        type: mongoose.SchemaTypes.ObjectId, //forma que o mongo guarda o id 
        ref: "User",
        require: true,
    },
    tasks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Task",
    }],
    createdAt: {
        type: Date,
        default: Date.now,
    },
});
const Project = mongoose.model("Project", ProjectSchema);

module.exports = Project;