import express from "express";
import createError from "http-errors";
import auth from "./routers/auth.js";
import event from "./routers/event.js";
import patient from "./routers/patient.js";
import user from "./routers/user.js";
import all from "./routers/all.js";

const router = express.Router();

router.use("/", event);
router.use("/", patient);
router.use("/", user);
router.use("/", all);
router.use("/auth", auth);

router.use((req, res, next) => {
  next(createError(404));
});


export default router;
