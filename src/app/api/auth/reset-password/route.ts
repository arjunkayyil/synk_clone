/**
 * POST /api/auth/reset-password
 * Validates the reset token and updates the user's password.
 */

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { token, email, password } = await req.json() as {
      token:    string;
      email:    string;
      password: string;
    };

    if (!token || !email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    // Hash the incoming raw token to compare with stored hash
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const user = await prisma.user.findFirst({
      where: {
        email,
        resetToken:       tokenHash,
        resetTokenExpiry: { gt: new Date() }, // not expired
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid or expired reset link. Please request a new one." },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await prisma.user.update({
      where: { id: user.id },
      data:  {
        passwordHash,
        resetToken:       null,
        resetTokenExpiry: null,
      },
    });

    return NextResponse.json({ message: "Password reset successfully. You can now sign in." });
  } catch (err) {
    console.error("Reset-password error:", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
