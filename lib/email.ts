import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendApplicantInvite(to: string, link: string) {
  await resend.emails.send({
    from: process.env.FROM_EMAIL!,
    to,
    subject: "Your QuestAI Interview Link",
    html: `<p>Click <a href="${link}">here</a> to start your interview.</p>`,
  });
}

interface SendApplicationStartEmailParams {
  applicantName: string;
  applicantEmail: string;
  positionTitle: string;
  publicId: string;
  applicationId: string;
}

interface SendApplicationCompleteEmailParams {
  applicantName: string;
  applicantEmail: string;
  positionTitle: string;
  managerName: string;
  managerEmail: string;
  applicationId: string;
}

export async function sendApplicationStartEmail({
  applicantName,
  applicantEmail,
  positionTitle,
  publicId,
  applicationId,
}: SendApplicationStartEmailParams) {
  const resumeLink = `${process.env.NEXTAUTH_URL}/public/${publicId}/start/${applicationId}`;

  try {
    await resend.emails.send({
      from: process.env.FROM_EMAIL!,
      to: applicantEmail,
      subject: `Interview Started - ${positionTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333;">Interview Application Started</h2>
          
          <p>Dear ${applicantName},</p>
          
          <p>Thank you for starting your application for the <strong>${positionTitle}</strong> position.</p>
          
          <p>You can continue your interview at any time by clicking the link below:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resumeLink}" 
               style="background-color: #007cba; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Continue Interview
            </a>
          </div>
          
          <p>If you have any questions or need assistance, please don&apos;t hesitate to reach out.</p>
          
          <p>Best regards,<br>The Hiring Team</p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="font-size: 12px; color: #666;">
            If you cannot click the button above, copy and paste this link into your browser:<br>
            <a href="${resumeLink}">${resumeLink}</a>
          </p>
        </div>
      `,
    });

    console.log(`Application start email sent successfully to ${applicantEmail}`);
    return { success: true };
  } catch (error: unknown) {
    console.error("Failed to send application start email:", error);
    return { success: false, error };
  }
}

export async function sendApplicationCompleteEmails({
  applicantName,
  applicantEmail,
  positionTitle,
  managerName,
  managerEmail,
  applicationId,
}: SendApplicationCompleteEmailParams) {
  const dashboardLink = `${process.env.NEXTAUTH_URL}/dashboard/applications/${applicationId}`;

  try {
    // Email to applicant
    await resend.emails.send({
      from: process.env.FROM_EMAIL!,
      to: applicantEmail,
      subject: `Interview Completed - ${positionTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333;">Interview Application Completed</h2>
          
          <p>Dear ${applicantName},</p>
          
          <p>Thank you for completing your interview for the <strong>${positionTitle}</strong> position.</p>
          
          <p>Your responses have been submitted successfully and are now being reviewed by our hiring team.</p>
          
          <p>We will be in touch soon with the next steps in the process.</p>
          
          <p>Best regards,<br>The Hiring Team</p>
        </div>
      `,
    });

    // Email to manager
    await resend.emails.send({
      from: process.env.FROM_EMAIL!,
      to: managerEmail,
      subject: `New Interview Completed - ${positionTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333;">New Interview Completed</h2>
          
          <p>Dear ${managerName},</p>
          
          <p><strong>${applicantName}</strong> has completed their interview for the <strong>${positionTitle}</strong> position.</p>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Applicant:</strong> ${applicantName}</p>
            <p style="margin: 5px 0 0 0;"><strong>Email:</strong> ${applicantEmail}</p>
          </div>
          
          <p>You can review their responses and provide feedback:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${dashboardLink}" 
               style="background-color: #007cba; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Review Application
            </a>
          </div>
          
          <p>Best regards,<br>QuestAI Interview System</p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="font-size: 12px; color: #666;">
            If you cannot click the button above, copy and paste this link into your browser:<br>
            <a href="${dashboardLink}">${dashboardLink}</a>
          </p>
        </div>
      `,
    });

    console.log(`Application complete emails sent to ${applicantEmail} and ${managerEmail}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to send application complete emails:", error);
    return { success: false, error };
  }
}
