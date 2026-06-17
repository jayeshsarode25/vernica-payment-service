import express from "express";
import authMiddleware from "../middleware/auth.middelware.js";
import * as paymentController from "../controller/payment.controller.js";

const router = express.Router();

router.post(
  "/create/:orderId",
  authMiddleware,
  paymentController.createPayment,
);

router.post("/verify", authMiddleware, paymentController.verifyPayment);

// router.post("/generate-signature", paymentController.generateTestSignature);//Temporary API

export default router;
