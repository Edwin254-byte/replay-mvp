/**
 * Utility functions for generating default interview messages
 */

export function getDefaultIntroMessage(positionTitle: string): string {
  return `Hello! Welcome to your interview for the ${positionTitle} position.

I'm excited to learn more about your background and experience. This interview will help us understand your qualifications and determine if you'd be a great fit for our team.

Please take your time with each question and feel free to provide detailed responses. There are no wrong answers - we're simply looking to get to know you better and understand your approach to problem-solving.

Let's get started!`;
}

export function getDefaultFarewellMessage(positionTitle: string): string {
  return `Thank you for taking the time to complete this interview for the ${positionTitle} position!

We appreciate the thoughtful responses you've provided. Our team will review your answers carefully and get back to you within the next few business days with updates on next steps.

If you have any questions in the meantime, please don't hesitate to reach out to our hiring team.

We look forward to potentially working with you!

Best regards,
The Hiring Team`;
}

/**
 * Get default messages based on position title
 */
export function getDefaultMessages(positionTitle: string) {
  return {
    intro: getDefaultIntroMessage(positionTitle),
    farewell: getDefaultFarewellMessage(positionTitle),
  };
}
