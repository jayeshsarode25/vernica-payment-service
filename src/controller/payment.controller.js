import paymentModel from "../model/payment.model.js";
import axios from "axios";
import razorpay from "../config/razorpay.js";
import config from "../config/config.js";
import { validatePaymentVerification } from "../../node_modules/razorpay/dist/utils/razorpay-utils.js";
import { AppError, catchAsync } from "../utils/error.utils.js"; // ✅

// ─────────────────────────────────────────────────────────────────
// CREATE PAYMENT
// ─────────────────────────────────────────────────────────────────
export const createPayment = catchAsync(async (req, res) => {
  const token  = req.cookies?.token || req.headers?.authorization?.split(" ")[1];
  const userId = req.user.userId;
  const { orderId } = req.params;

  // fetch order from order service
  const orderResponse = await axios.get(
    `${config.ORDER_API_URL}/${orderId}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  const price = orderResponse.data.order.totalPrice;

  if (!price?.amount) {
    throw new AppError("Order has no price", 400);
  }

  // create razorpay order
  const razorpayOrder = await razorpay.orders.create({
    amount:   price.amount * 100, // convert to paise
    currency: price.currency,
  });

  const newPayment = await paymentModel.create({
    order:           orderId,
    razorpayOrderId: razorpayOrder.id,
    user:            userId,
    price: {
      amount:   razorpayOrder.amount,
      currency: razorpayOrder.currency,
    },
  });

  res.status(201).json({ message: "Payment initiated", newPayment });
});

// ─────────────────────────────────────────────────────────────────
// VERIFY PAYMENT
// ─────────────────────────────────────────────────────────────────
export const verifyPayment = catchAsync(async (req, res) => {
  const { razorpayOrderId, paymentId, signature } = req.body;

  if (!razorpayOrderId || !paymentId || !signature) {
    throw new AppError("razorpayOrderId, paymentId and signature are required", 400);
  }

  const isValid = validatePaymentVerification(
    { order_id: razorpayOrderId, payment_id: paymentId },
    signature,
    config.RAZORPAY_KEY_SECRET
  );

  if (!isValid) {
    throw new AppError("Invalid payment signature", 400);
  }

  const payment = await paymentModel.findOne({
    razorpayOrderId,
    status: "PENDING",
  });

  if (!payment) {
    throw new AppError("Payment not found", 404);
  }

  payment.paymentId = paymentId;
  payment.signature = signature;
  payment.status    = "COMPLETED";
  await payment.save();

  res.status(200).json({ message: "Payment verified successfully", payment });
});
