import { getAll } from "../../../controllers/all.js";
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

router.route("/all").get(
  isAuthenticated,
  handler(getAll, false, (req, res, next) => ({
    ...req.query,
  }))
);

export default router;
