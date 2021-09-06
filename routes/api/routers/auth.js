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

router.route("/signup").post(
  isNotAuthenticated,
  handler(postSignUp, true, (req, res, next) => ({
    ...req.body,
  }))
);

router.route("/login").post(
  isNotAuthenticated,
  handler(postLogIn, true, (req, res, next) => ({
    res,
    ...req.body,
  }))
);

router.route("/logout").post(
  isAuthenticated,
  handler(postLogOut, true, (req, res, next) => ({
    res,
  }))
);

router.route("/refresh_token").post(
  handler(postRefreshToken, true, (req, res, next) => ({
    req,
    res,
    next,
  }))
);

export default router;
