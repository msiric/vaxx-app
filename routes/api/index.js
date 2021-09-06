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
  createError(404);
});

router.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.json({ status_code: err.status || 500, error: err.message });
});

export default router;
