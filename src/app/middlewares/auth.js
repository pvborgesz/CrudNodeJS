const jwt = require("jsonwebtoken");
const authConfig = require("../../config/auth.json");

module.exports = (req, res, next) => {
    const authHeader = req.headers.authorization;
    // console.log(authHeader);
    if (!authHeader) {
        return res.status(401).send({ error: "No token provided" });
    }

    const parts = authHeader.split(" ");

    if (!parts.length === 2) {
        return res.status(401).send({ error: "Token error" });
    }
    //Bearer + hash

    const [scheme, token] = parts; // scheme = bearer , token = hash

    if (!/^Bearer$/i.test(scheme)) { // testando se scheme tem bearer
        return res.status(401).send({ error: "Token malformatted" });
    }

    jwt.verify(token, authConfig.secret, (err, decoded) => {
        if (err) return res.status(401).send({ error: "Token invalid." });

        req.userId = decoded.id;
        return next();
    })
}