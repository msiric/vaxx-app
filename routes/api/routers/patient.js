import { getPatients, patchPatient } from "../../../controllers/patient.js";
import express from "express";
import {
  forgotPassword,
  postLogIn,
  postLogOut,
  postRefreshToken,
  postRevokeToken,
  postSignUp,
  resendToken,
  resetPassword,
  updateEmail,
  verifyRegisterToken,
} from "../../../controllers/auth.js";
import {
  isAuthenticated,
  isNotAuthenticated,
  requestHandler as handler,
} from "../../../utils/helpers.js";

const router = express.Router();

router.route("/patients").get(
  isAuthenticated,
  handler(getPatients, false, (req, res, next) => ({
    ...req.query,
  }))
);

router.route("/patients/:patientId").patch(
  isAuthenticated,
  handler(patchPatient, true, (req, res, next) => ({
    ...req.params,
    patientData: { ...req.body },
  }))
);

export default router;
