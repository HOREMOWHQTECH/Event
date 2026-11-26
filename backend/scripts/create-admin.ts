import mongoose, { Schema } from 'mongoose';
import { randomBytes, scrypt as _scrypt } from "node:crypto";
import { promisify } from "node:util";
import * as dotenv from 'dotenv';

const scrypt = promisify(_scrypt);


dotenv.config({ path: '../.env' });

// ── 1. INLINED PASSWORD HASHER ─────────────────────────────────────────────
// This creates the exact $scrypt$ hash format your auth route expects
async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const derived = (await scrypt(password, salt, 64)) as Buffer;
  return `$scrypt$N=16384,r=8,p=1$${salt.toString("base64")}$${derived.toString("base64")}`;
}
// ───────────────────────────────────────────────────────────────────────────

// ── 2. INLINED SCHEMA ──────────────────────────────────────────────────────
const StaffUserSchema = new Schema({
  fullName: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, unique: true, sparse: true },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, required: true, default: 'staff' },
  isActive: { type: Boolean, default: true },
  totpEnabled: { type: Boolean, default: false },
  totpSecret: { type: String, select: false },
}, { collection: 'staff_users', timestamps: true });

const StaffUser = (mongoose.models.StaffUser || mongoose.model('StaffUser', StaffUserSchema)) as mongoose.Model<any>;
// ───────────────────────────────────────────────────────────────────────────

async function createAdmin() {
  const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

  if (!MONGO_URI) {
    console.error("❌ Error: MONGODB_URI or MONGO_URI is not set in your .env file.");
    process.exit(1);
  }

  const ADMIN_USERNAME = 'admin';
  const ADMIN_PASSWORD = 'SuperSecretAdminPassword123!'; // Min 12 chars
  const ADMIN_FULLNAME = 'System Administrator';
  const ADMIN_EMAIL = 'admin@example.com';

  try {
    console.log("⏳ Connecting to database...");
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected.");

    const existingAdmin = await StaffUser.findOne({ username: ADMIN_USERNAME.toLowerCase() });
    if (existingAdmin) {
      console.log(`⚠️ Staff user '${ADMIN_USERNAME}' already exists.`);
      process.exit(0);
    }

    console.log("🔐 Hashing password...");
    const passwordHash = await hashPassword(ADMIN_PASSWORD);

    console.log("👤 Creating admin user...");
    const admin = await StaffUser.create({
      fullName: ADMIN_FULLNAME,
      username: ADMIN_USERNAME.toLowerCase(),
      email: ADMIN_EMAIL.toLowerCase(),
      passwordHash,
      role: 'admin',
      isActive: true,
    });

    console.log("\n🎉 Admin created successfully!");
    console.log("--------------------------------------------------");
    console.log(`Username: ${ADMIN_USERNAME}`);
    console.log(`Password: ${ADMIN_PASSWORD}`);
    console.log(`Role:     ${admin.role}`);
    console.log("--------------------------------------------------");
    console.log("You can now log in at /staff/login\n");

  } catch (error) {
    console.error("❌ Failed to create admin:", error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

createAdmin();