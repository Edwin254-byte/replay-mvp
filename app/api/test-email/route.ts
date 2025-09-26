import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export async function GET(request: NextRequest) {
  try {
    // Check environment variables
    const apiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.FROM_EMAIL;

    if (!apiKey) {
      return NextResponse.json(
        {
          error: "RESEND_API_KEY environment variable not found",
          debug: { hasApiKey: false, hasFromEmail: !!fromEmail },
        },
        { status: 500 }
      );
    }

    if (!fromEmail) {
      return NextResponse.json(
        {
          error: "FROM_EMAIL environment variable not found",
          debug: { hasApiKey: true, hasFromEmail: false },
        },
        { status: 500 }
      );
    }

    // Initialize Resend
    const resend = new Resend(apiKey);

    // Test email - send to the same FROM_EMAIL address for testing
    await resend.emails.send({
      from: fromEmail,
      to: process.env.TEST_EMAIL!,
      subject: "Resend Test Email",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333;">Resend Test Email</h2>
          <p>This is a test email to verify Resend integration is working correctly.</p>
          <p>If you received this email, your Resend configuration is working!</p>
          <p><strong>API Key Length:</strong> ${apiKey.length} characters</p>
          <p><strong>From Email:</strong> ${fromEmail}</p>
        </div>
      `,
    });

    return NextResponse.json({
      success: true,
      message: "Test email sent successfully",
      debug: {
        apiKeyLength: apiKey.length,
        fromEmail: fromEmail,
        apiKeyPrefix: apiKey.substring(0, 5) + "...",
      },
    });
  } catch (error: unknown) {
    console.error("Resend test failed:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Resend test failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
