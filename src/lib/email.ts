import nodemailer from 'nodemailer'

// Create transporter for Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_EMAIL,
    pass: process.env.GMAIL_APP_PASSWORD
  }
})

export interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

export async function sendEmail({ to, subject, html, text }: EmailOptions): Promise<void> {
  try {
    await transporter.sendMail({
      from: process.env.GMAIL_EMAIL,
      to,
      subject,
      html,
      text
    })
    console.log('Email sent successfully to:', to)
  } catch (error) {
    console.error('Failed to send email:', error)
    throw error
  }
}

// Template for event request confirmation email
export function getEventRequestConfirmationEmail(name: string, eventTitle: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Sportograf - Event Request Confirmation</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background: #4a90e2;
          color: white;
          padding: 20px;
          text-align: center;
        }
        .content {
          padding: 20px;
          background: #f9f9f9;
        }
        .event-details {
          background: white;
          padding: 15px;
          border-radius: 5px;
          margin: 20px 0;
        }
        .footer {
          text-align: center;
          padding: 20px;
          color: #666;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Sportograf - Event Request Confirmation</h1>
        </div>
        <div class="content">
          <p>Dear ${name},</p>
          <p>Thank you for your interest in attending the event. Your request has been successfully submitted and is currently pending approval.</p>
          
          <div class="event-details">
            <h3>Event Details</h3>
            <p><strong>Event:</strong> ${eventTitle}</p>
            <p><strong>Status:</strong> Pending Approval</p>
          </div>
          
          <p>You will receive a notification once your request has been reviewed. If you have any questions, please contact the administrator.</p>
          
          <p>Best regards,<br>The Sportograf Event Team</p>
        </div>
        <div class="footer">
          <p>This is an automated email from Sportograf. Please do not reply.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

// Template for travel form confirmation email
export function getTravelFormConfirmationEmail(
  name: string, 
  eventTitle: string, 
  region: string,
  travelMethod?: string,
  accommodationNeeded?: string,
  hotelNights?: string[]
): string {
  const travelMethodDisplay = travelMethod ? travelMethod.charAt(0).toUpperCase() + travelMethod.slice(1) : 'Not specified'
  const accommodationDisplay = accommodationNeeded === 'yes' 
    ? (hotelNights && hotelNights.length > 0 ? hotelNights.join(', ') : 'Yes')
    : 'No'

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Sportograf - Travel Form Confirmation</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background: #4a90e2;
          color: white;
          padding: 20px;
          text-align: center;
        }
        .content {
          padding: 20px;
          background: #f9f9f9;
        }
        .event-details {
          background: white;
          padding: 15px;
          border-radius: 5px;
          margin: 20px 0;
        }
        .footer {
          text-align: center;
          padding: 20px;
          color: #666;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Sportograf - Travel Form Confirmation</h1>
        </div>
        <div class="content">
          <p>Dear ${name},</p>
          <p>Thank you for submitting your travel form. Your submission has been successfully received and is currently pending review.</p>
          
          <div class="event-details">
            <h3>Submission Details</h3>
            <p><strong>Event:</strong> ${eventTitle}</p>
            <p><strong>Region:</strong> ${region.toUpperCase()}</p>
            <p><strong>Transport Method:</strong> ${travelMethodDisplay}</p>
            <p><strong>Accommodation Needed:</strong> ${accommodationDisplay}</p>
            <p><strong>Status:</strong> Pending Review</p>
          </div>
          
          <p>You will receive a notification once your travel form has been reviewed. If you have any questions, please contact the administrator.</p>
          
          <p>Best regards,<br>The Sportograf Travel Team</p>
        </div>
        <div class="footer">
          <p>This is an automated email from Sportograf. Please do not reply.</p>
        </div>
      </div>
    </body>
    </html>
  `
}
