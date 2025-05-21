import express from "express";
import routerUser from "../../api/v1/turso/user.js";
import routerNote from "../../api/v1/turso/note.js";
import mongoUser from "./mongo/users.js"
import mongoNote from "./mongo/notes.js"

const router = express.Router();

export default (db) => {
    router.use(routerNote(db));
    router.use(routerUser(db));
    router.use("/mongo", mongoUser)
    router.use("/mongo", mongoNote)
    return router
};