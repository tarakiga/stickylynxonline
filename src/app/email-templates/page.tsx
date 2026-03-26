import * as React from "react";
import { EMAIL_COLORS } from "@/config/theme";
import { getBaseUrl } from "@/lib/utils";

export default function EmailTemplatesPreview() {
  const base = getBaseUrl() || "http://localhost:3000";
  const brand = { name: process.env.APP_NAME || "Stickylynx" };

  const taskSubmissionHtml = `
    <div style="font-family: sans-serif; padding: 20px;">
      <h2 style="color: ${EMAIL_COLORS.primary};">Hello from Project Portal!</h2>
      <p>The latest updates for <strong>Homepage Wireframes</strong> are ready for your review.</p>
      <div style="background: ${EMAIL_COLORS.surfaceMuted}; padding: 15px; border-radius: 8px; margin: 15px 0;">
        <p><strong>Submission Type:</strong> url</p>
        <p><strong>Message:</strong> Check the project portal for details.</p>
      </div>
      <p><a href="${base}/demo-portal" style="background: ${EMAIL_COLORS.primary}; color: ${EMAIL_COLORS.onPrimary}; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: bold;">Launch Project Portal</a></p>
    </div>
  `;

  const commentHtml = `
    <div style="font-family: sans-serif; padding: 20px;">
      <h2 style="color: ${EMAIL_COLORS.primary};">New Client Feedback</h2>
      <p><strong>Client</strong> left a comment on your project: <strong>Project Portal</strong>.</p>
      <div style="background: ${EMAIL_COLORS.surfaceMuted}; padding: 15px; border-radius: 8px; margin: 15px 0;">
        "Can we try a lighter header background on mobile?"
      </div>
      <p>Login to your <a href="${base}/dashboard">dashboard</a> to reply.</p>
    </div>
  `;

  const approvedHtml = `
    <div style="font-family: sans-serif; padding: 20px;">
      <h2 style="color: ${EMAIL_COLORS.primary};">Great news!</h2>
      <p>The client has approved your task: <strong>Homepage Wireframes v2</strong> on the project <strong>Project Portal</strong>.</p>
      <p>Visit your dashboard to view the next steps.</p>
    </div>
  `;

  const signupHtml = `
    <div style="font-family: sans-serif; padding: 20px;">
      <h2 style="color: ${EMAIL_COLORS.primary};">Welcome to ${brand.name}</h2>
      <p>We're excited to have you onboard. Start building your professional Lynx today.</p>
      <p><a href="${base}/dashboard" style="background: ${EMAIL_COLORS.primary}; color: ${EMAIL_COLORS.onPrimary}; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: bold;">Go to Dashboard</a></p>
      <p style="color:#64748b; font-size:12px;">If you didn't sign up, please ignore this email.</p>
    </div>
  `;

  const forgotHtml = `
    <div style="font-family: sans-serif; padding: 20px;">
      <h2 style="color: ${EMAIL_COLORS.primary};">Reset your password</h2>
      <p>We received a request to reset your password for ${brand.name}.</p>
      <p><a href="${base}/reset-password?token=example" style="background: ${EMAIL_COLORS.primary}; color: ${EMAIL_COLORS.onPrimary}; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: bold;">Reset Password</a></p>
      <p style="color:#64748b; font-size:12px;">If you didn't request a password reset, you can safely ignore this email.</p>
    </div>
  `;

  const cards: { title: string; html: string }[] = [
    { title: "Task Submission (Client)", html: taskSubmissionHtml },
    { title: "New Comment (Freelancer)", html: commentHtml },
    { title: "Task Approved (Freelancer)", html: approvedHtml },
    { title: "Signup Welcome", html: signupHtml },
    { title: "Forgot Password", html: forgotHtml },
  ];

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Email Templates Preview</h1>
        <p className="text-text-secondary text-sm">These previews use EMAIL_COLORS and example data.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {cards.map((c, i) => (
          <div key={i} className="bg-surface border border-divider rounded-2xl shadow-sm p-4">
            <h2 className="font-bold text-text-primary mb-3">{c.title}</h2>
            <div
              className="border border-divider rounded-xl overflow-auto bg-white"
              style={{ minHeight: 240 }}
              dangerouslySetInnerHTML={{ __html: c.html }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

