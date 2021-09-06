import { getPatients, patchPatient } from "../../../controllers/patient.js";
import express from "express";
import { deactivateUser, editPreferences } from "../../../controllers/user.js";
import {
  isAuthenticated,
  isAuthorized,
  isNotAuthenticated,
  requestHandler as handler,
} from "../../../utils/helpers.js";

const router = express.Router();

router.route("/users/:userId/preferences").patch(
  [isAuthenticated, isAuthorized],
  handler(editPreferences, false, (req, res, next) => ({
    ...req.params,
    ...req.body,
  }))
);

router.route("/users/:userId/deactivate").post(
  [isAuthenticated, isAuthorized],
  handler(deactivateUser, false, (req, res, next) => ({
    ...req.params,
  }))
);

export default router;
