import { config as dotenvconfig } from "dotenv";
dotenvconfig();

// ─────────────────────────────────────────────────────────────────
// ENV VALIDATOR — Payment Service
// ─────────────────────────────────────────────────────────────────

const REQUIRED_VARS = [
  "MONGO_URI",
  "JWT_SECRET",
  "RABBITMQ_URI",
  "RAZORPAY_KEY_ID",
  "RAZORPAY_KEY_SECRET",
];

const missing = REQUIRED_VARS.filter((key) => !process.env[key]);

if (missing.length > 0) {
  console.error("❌ Missing required environment variables:");
  missing.forEach((key) => console.error(`   - ${key}`));
  console.error("\nAdd the missing variables to your .env file and restart.");
  process.exit(1);
}

const _config = {
  MONGO_URI:           process.env.MONGO_URI,
  JWT_SECRET:          process.env.JWT_SECRET,
  RABBITMQ_URI:        process.env.RABBITMQ_URI,
  RAZORPAY_KEY_ID:     process.env.RAZORPAY_KEY_ID,
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,
  ORDER_API_URL:       process.env.ORDER_API_URL || "http://localhost:3004/api/orders",
};

export default _config;
