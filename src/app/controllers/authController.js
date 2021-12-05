const express = require("express");
const bcrypt = require("bcryptjs");
const authConfig = require("../../config/auth")
const User = require("../models/user");
const jwt = require("jsonwebtoken")
const router = express.Router();
const crypto = require("crypto");
const mailer = require("../../modules/mailer");


function generateToken(params = {}) {
    return jwt.sign(params, authConfig.secret, {
        expiresIn: 60 * 60 * 60,
    })
}


router.post("/register", async (req, res) => {
    const { email } = req.body;

    try {
        if (await User.findOne({ email })) {
            return res.status(400).send({ error: "User already exists" });
        }
        const user = await User.create(req.body);

        user.password = undefined;

        return res.send({ user, token: generateToken({ id: user.id }) }); // passando o token na hora do registro, para não ter que fazer login após o registro
    } catch (err) {
        return res.status(400).send({ error: "Registration failed." });
    }
});

router.post("/authenticate", async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
        return res.status(400).send({ error: "User not found." });
    }
    if (!await bcrypt.compare(password, user.password)) { //comparação entre a senha digitada e a senha descriptografada
        return res.status(400).send({ error: "Invalid password." });
    }

    user.password = undefined; // remover na hora de listar a password

    const token = jwt.sign({ id: user.id }, authConfig.secret, {
        expiresIn: 60 * 60 * 60,
    }) // chave, hash


    res.send({ user, token: generateToken({ id: user.id }) });
});

router.post("/forgot_password", async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).send({ error: "user not found." });
        }

        const token = crypto.randomBytes(20).toString("hex");

        const now = new Date();
        now.setHours(now.getHours() + 1);

        await User.findByIdAndUpdate(user.id, {
            "$set": {
                passwordResetToken: token,
                passwordResetExpires: now,
            }
        })
        // console.log(token, now);
        mailer.sendMail({
            to: email,
            from: "b18162aae8-1d9969@inbox.mailtrap.io",
            template: "auth/forgot_password",
            context: { token }
        }, (err) => {
            if (err) {
                console.log(err)
                return res.status(400).send({ error: "cannot send forgot password" });
            }

            return res.send();
        });
    } catch (err) {
        console.log(err);
        return res.status(400).send({ error: "error on forgot password, try again." });
    }
});

module.exports = app => {
    app.use("/auth", router);
}