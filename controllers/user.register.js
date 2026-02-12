import TryCatch from "../middlewares/TryCatch.js";
import sanitize from "mongo-sanitize";
import { registerSchema } from "../config/zod.js";
import { redisClient } from "../index.js";  
import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import sendmail from "../config/sendMail.js";
import { getVerifyEmailHtml } from "../config/html.js";

export const registerUser = TryCatch(async (req, res) => {
  const sanitizedBody = sanitize(req.body);
  const validation = registerSchema.safeParse(sanitizedBody);

  if (!validation.success) {
    return res.status(400).json({
      message: "Validation failed",
      errors: validation.error.errors,
    });
  }

  const { name, email, password } = validation.data;

  // Rate limit key
  const ratelimitKey = `register-ratelimit-${req.ip}:${email}`;
  if (await redisClient.exists(ratelimitKey)) {
    return res.status(429).json({
      message: "Too many registration attempts. Please try again later.",
    });
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: "Email already in use" });
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Generate verification token
  const verificationToken = crypto.randomBytes(32).toString("hex");
  const verifyKey = `verify-token-${verificationToken}`;

  // Store user data temporarily in Redis (stringify!)
  const dataToStore = {
    name,
    email,
    password: hashedPassword,
  };

  await redisClient.setEx(verifyKey, 300, JSON.stringify(dataToStore));

  // Send verification email
  const subject = "Verify your email";
  const html = getVerifyEmailHtml({ email, token: verificationToken });

  await sendmail({ email, subject, html });

  // Set rate limit flag
  await redisClient.setEx(ratelimitKey, 60, "true");

  res.json({
    message:
      "Registration successful. Please check your email to verify your account.",
  });
});