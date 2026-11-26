/**
 * POST /api/auth/forgot-password
 * Generates a secure reset token, stores it (hashed) in the DB,
 * and sends a reset link to the user's email.
 */

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/mailer";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json() as { email: string };

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    // Always return success even if user not found — prevents email enumeration
    if (!user) {
      return NextResponse.json({ message: "If that email exists, a reset link has been sent." });
    }

    // Generate a cryptographically secure token
    const rawToken   = crypto.randomBytes(32).toString("hex");
    const tokenHash  = crypto.createHash("sha256").update(rawToken).digest("hex");
    const expiry     = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.user.update({
      where: { email },
      data:  { resetToken: tokenHash, resetTokenExpiry: expiry },
    });

    const appUrl   = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const resetUrl = `${appUrl}/reset-password?token=${rawToken}&email=${encodeURIComponent(email)}`;

    await sendPasswordResetEmail(email, user.name, resetUrl);

    return NextResponse.json({ message: "If that email exists, a reset link has been sent." });
  } catch (err) {
    console.error("Forgot-password error:", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
