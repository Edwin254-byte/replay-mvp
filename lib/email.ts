import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendApplicantInvite(to: string, link: string) {
  await resend.emails.send({
    from: process.env.FROM_EMAIL!,
    to,
    subject: "Your Replay Interview Link",
    html: `<p>Click <a href="${link}">here</a> to start your interview.</p>`,
  });
}
