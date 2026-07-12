import os
import smtplib
import datetime
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import logging

logger = logging.getLogger(__name__)

# SMTP settings from environment
SMTP_HOST = os.getenv("SMTP_HOST", "")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
SMTP_FROM_EMAIL = os.getenv("SMTP_FROM_EMAIL", "no-reply@ecosphere.com")

def _send_email_base(to_email: str, subject: str, html_content: str):
    """Base function to send email via SMTP, falling back to writing to local file and stdout."""
    # Write to local sent log first for visibility/audit
    sent_log_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "emails_sent.log")
    log_entry = f"========================================\n"
    log_entry += f"Date/Time: {datetime.datetime.now().isoformat()}\n"
    log_entry += f"To: {to_email}\n"
    log_entry += f"Subject: {subject}\n"
    log_entry += f"Content:\n{html_content}\n"
    log_entry += f"========================================\n\n"
    
    try:
        with open(sent_log_path, "a", encoding="utf-8") as f:
            f.write(log_entry)
        print(f"[MAIL SENT Fallback] Logged email to {to_email} with subject: {subject}")
    except Exception as log_err:
        logger.error(f"Failed to log email to file: {log_err}")

    # Check if SMTP configuration is fully supplied
    if not (SMTP_HOST and SMTP_USER and SMTP_PASSWORD):
        logger.info("SMTP settings not fully configured. Falling back to local file logging (emails_sent.log).")
        return

    # Attempt SMTP delivery
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = SMTP_FROM_EMAIL
        msg["To"] = to_email
        
        # Plain text fallback
        text_part = MIMEText("This email is formatted in HTML. Please open in an HTML-capable mail client.", "plain")
        html_part = MIMEText(html_content, "html")
        msg.attach(text_part)
        msg.attach(html_part)
        
        # Connect to SMTP server
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=10) as server:
            if SMTP_PORT == 587:
                server.starttls()
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.sendmail(SMTP_FROM_EMAIL, to_email, msg.as_string())
        logger.info(f"Email successfully delivered to {to_email}")
        print(f"[MAIL SMTP] Email delivered to {to_email}")
    except Exception as smtp_err:
        logger.error(f"SMTP delivery failed to {to_email}: {smtp_err}")


def send_welcome_email(to_email: str, full_name: str):
    subject = "Welcome to EcoMerge AI - Enterprise ESG Platform!"
    html_content = f"""
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f8fafc; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 16px; bg-color: #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          <h2 style="color: #10b981; margin-top: 0;">Welcome to EcoMerge, {full_name}!</h2>
          <p>Your enterprise ESG workspace account has been created successfully.</p>
          <p>With EcoMerge, you can now:</p>
          <ul>
            <li>Log and track Scope 1, 2, and 3 carbon emissions.</li>
            <li>Earn levels, points, and badges by completing sustainability challenges.</li>
            <li>Monitor CSR volunteer activities and diversity indexes.</li>
            <li>Generate GRI and DEFRA audit-ready compliance reports.</li>
          </ul>
          <p>We're thrilled to have you join our sustainability mission.</p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="font-size: 11px; color: #718096; text-align: center;">EcoMerge AI ESG Platform &bull; Built-in automated ledger notification</p>
        </div>
      </body>
    </html>
    """
    _send_email_base(to_email, subject, html_content)


def send_carbon_entry_email(to_email: str, full_name: str, activity_type: str, quantity: float, unit: str, kgco2e: float):
    subject = f"Carbon Entry Notification: {activity_type} Logged"
    html_content = f"""
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f8fafc; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 16px; bg-color: #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          <h2 style="color: #3b82f6; margin-top: 0;">New Carbon Entry Recorded</h2>
          <p>Hello {full_name},</p>
          <p>A new carbon transaction has been successfully logged into the ERP sustainability ledger:</p>
          <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
            <tr style="background-color: #f7fafc;">
              <th style="padding: 10px; border: 1px solid #edf2f7; text-align: left;">Activity</th>
              <td style="padding: 10px; border: 1px solid #edf2f7;">{activity_type}</td>
            </tr>
            <tr>
              <th style="padding: 10px; border: 1px solid #edf2f7; text-align: left;">Quantity</th>
              <td style="padding: 10px; border: 1px solid #edf2f7;">{quantity} {unit}</td>
            </tr>
            <tr style="background-color: #f7fafc;">
              <th style="padding: 10px; border: 1px solid #edf2f7; text-align: left;">Calculated Impact</th>
              <td style="padding: 10px; border: 1px solid #edf2f7; font-weight: bold; color: #e53e3e;">{kgco2e:.2f} kgCO2e</td>
            </tr>
          </table>
          <p>The system has updated your department's environmental goal metrics and active dashboard charts accordingly.</p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="font-size: 11px; color: #718096; text-align: center;">EcoMerge AI ESG Platform &bull; Automated Ledger Telemetry</p>
        </div>
      </body>
    </html>
    """
    _send_email_base(to_email, subject, html_content)
