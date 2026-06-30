import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { config } from "../config/index.js";
import { connectDatabase } from "./connection.js";
import { Firm } from "../modules/firm/schemas/firm.schema.js";
import { User } from "../modules/users/schemas/user.schema.js";
import { Role } from "../modules/roles/schemas/role.schema.js";
import { UserRole } from "../modules/roles/schemas/user-role.schema.js";
import { UserStatus, TimeFormat } from "../modules/users/types/user.types.js";
import { seedSystemPermissionsAndRoles } from "../modules/roles/service/permission.service.js";

async function seedDevData() {
  console.log("[SEED] Starting development database seeding...");

  // 1. Connect to Database
  await connectDatabase();

  // 2. Run system permissions and roles seed
  await seedSystemPermissionsAndRoles();

  // 3. Find or Create a Law Firm
  let firm = await Firm.findOne({ name: "Demo Law Firm" });
  if (!firm) {
    firm = await Firm.create({
      name: "Demo Law Firm",
      legalName: "Demo Law Firm LLC",
      displayName: "Demo Law",
      timezone: "UTC",
      currency: "USD",
      locale: "en-US",
      dateFormat: "YYYY-MM-DD",
      timeFormat: "24",
      defaultBillingRate: 150,
      isActive: true,
    });
    console.log(`[SEED] Created default law firm: ${firm.name} (${firm._id})`);
  } else {
    console.log(`[SEED] Found existing law firm: ${firm.name} (${firm._id})`);
  }

  // 4. Find the Owner Role
  const ownerRole = await Role.findOne({ name: "Firm Owner", isSystemRole: true });
  if (!ownerRole) {
    throw new Error("System role 'Firm Owner' not found. Ensure permissions seed ran successfully.");
  }

  // 5. Create the Admin User
  const adminEmail = "admin@practice365.com";
  let adminUser = await User.findOne({ email: adminEmail });

  if (!adminUser) {
    const passwordHash = await bcrypt.hash("password123", 10);
    adminUser = await User.create({
      firmId: firm._id,
      email: adminEmail,
      firstName: "Admin",
      lastName: "User",
      displayName: "Admin User",
      phone: "+15551234567",
      jobTitle: "Managing Partner",
      status: UserStatus.ACTIVE,
      timezone: "UTC",
      language: "en",
      dateFormat: "YYYY-MM-DD",
      timeFormat: TimeFormat.TWENTY_FOUR,
      notificationPreferences: {
        email: true,
        marketing: false,
      },
      passwordHash,
      isEmailVerified: true,
      isDisabled: false,
      failedLoginAttempts: 0,
      lockoutUntil: null,
    });
    console.log(`[SEED] Created default admin user: ${adminEmail}`);
  } else {
    console.log(`[SEED] Admin user already exists: ${adminEmail}`);
  }

  // 6. Assign the Owner Role to the Admin User
  const existingUserRole = await UserRole.findOne({
    userId: adminUser._id,
    roleId: ownerRole._id,
  });

  if (!existingUserRole) {
    await UserRole.create({
      userId: adminUser._id,
      roleId: ownerRole._id,
      assignedBy: adminUser._id,
      assignedAt: new Date(),
    });
    console.log(`[SEED] Assigned 'Firm Owner' role to admin user: ${adminEmail}`);
  } else {
    console.log(`[SEED] Admin user already has 'Firm Owner' role`);
  }

  console.log("\n==================================================");
  console.log(" DEVELOPMENT SEED COMPLETED SUCCESSFULLY ");
  console.log("==================================================");
  console.log(` Login Email:    ${adminEmail}`);
  console.log(" Login Password: password123");
  console.log("==================================================\n");

  await mongoose.disconnect();
  console.log("[SEED] Disconnected from MongoDB.");
  process.exit(0);
}

seedDevData().catch((error) => {
  console.error("[SEED] Seeding failed:", error);
  process.exit(1);
});
