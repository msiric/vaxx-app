import express from "express";
import {
  getEvents,
  postEvent,
  patchEvent,
  deleteEvent,
  getSelectedEvents,
} from "../../../controllers/event.js";
import {
  isAuthenticated,
  isNotAuthenticated,
  requestHandler as handler,
} from "../../../utils/helpers.js";

const router = express.Router();

router
  .route("/events")
  .get(
    isAuthenticated,
    handler(getEvents, false, (req, res, next) => ({
      ...req.query,
    }))
  )
  .post(
    isAuthenticated,
    handler(postEvent, true, (req, res, next) => ({
      ...req.body,
    }))
  );

/* router.route("/events/:eventId").patch(
  isAuthenticated,
  handler(patchEvent, true, (req, res, next) => ({
    ...req.params,
    eventData: { ...req.body },
  }))
); */

router.route("/events/cron").get(
  isNotAuthenticated,
  handler(getSelectedEvents, false, (req, res, next) => ({
    ...req.query,
  }))
);

router.route("/events/:eventId").delete(
  isAuthenticated,
  handler(deleteEvent, true, (req, res, next) => ({
    ...req.params,
  }))
);

export default router;
