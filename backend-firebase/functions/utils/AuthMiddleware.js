const { admin, db } = require("./admin");

// firebase request authentication middleware
module.exports = (req, res, next) => {
    let idToken;
    if(req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
        idToken = req.headers.authorization.split(" ")[1];
    }
    else {
        console.error("No token found!");
        return res.status(403).send({error: "Unauthorized!"})
    }

    admin.auth().verifyIdToken(idToken)
        .then(decodedToken => {
            req.user = decodedToken;
            return db.collection("users")
                .where("userId", "==", req.user.uid)
                .limit(1)
                .get()
        })
        .then(data => {
            req.user.handle = data.docs[0].data().handle;
            return next();
        })
        .catch(err => {
            console.error(err);
            return res.status(403).send({error: err.toString()});
        })
}