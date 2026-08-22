import mongoose from "mongoose";
import axios from "axios";
import { User } from "./src/models/user.models.js";

async function test() {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb+srv://collab:collabsphere@cluster0.5vawtoi.mongodb.net/collabSphere");
    console.log("Connected to MongoDB");

    // Register user
    const email = "test12345@example.com";
    const res = await axios.post("http://localhost:8000/api/v1/auth/register", {
      username: "testuser12345",
      email,
      password: "password123",
      fullName: "Test User"
    });
    console.log("Registered:", res.data);

    // Get user from DB
    const user = await User.findOne({ email });
    console.log("User in DB:", user.emailVerificationToken, user.emailVerificationExpiry);

    // Try verifying
    // But we need the unHashedToken, which is sent via email! 
    // We can't see the unHashedToken because we didn't mock the email.
    // Let's just find the latest email sent in mailtrap? Or just read it from the mailtrap sandbox API.
  } catch (err) {
    console.error(err.response ? err.response.data : err);
  } finally {
    process.exit(0);
  }
}
test();
