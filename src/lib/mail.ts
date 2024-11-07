"use server";

import { Resend } from "resend";

import { ContactFormSchema } from "@/schemas/contact-form";
import { EmailTemplate } from "@/components/contact/email-template";

const resend = new Resend(process.env.RESEND_API_KEY);
const portfolioEmail = process.env.PORTFOLIO_EMAIL || "";
const personalEmail = process.env.PERSONAL_EMAIL || "";

export async function sendEmail(formData: FormData) {
  const result = ContactFormSchema.safeParse({
    fullname: formData.get("fullname"),
    email: formData.get("email"),
    subject: formData.get("subject"),
    message: formData.get("message"),
  });

  if (!result.success) {
    return { error: "Invalid form data" };
  }

  if (!portfolioEmail || !personalEmail) {
    return { error: "Email configuration is missing" };
  }

  const { fullname, email, subject, message } = result.data;

  try {
    const data = await resend.emails.send({
      from: `Portfolio <${portfolioEmail}>`,
      to: [personalEmail],
      subject: subject,
      react: EmailTemplate({ fullName: fullname, email, content: message }),
    });

    console.log("Successfully sent email", data);

    return { success: true, data };
  } catch (error) {
    console.error("Failed to send email", error);

    return { error: "Failed to send email" };
  }
}
