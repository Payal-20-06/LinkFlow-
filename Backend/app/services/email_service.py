import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import threading

from app.config import settings

def _send_email_async(to_email: str, subject: str, html_body: str):
    """Sends an email in a separate thread so it doesn't block the API request."""
    if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
        print("WARNING: Email not sent. SMTP_USER or SMTP_PASSWORD is not configured.")
        print(f"To: {to_email}\nSubject: {subject}\nBody: {html_body}")
        return

    msg = MIMEMultipart()
    msg['From'] = settings.SMTP_USER
    msg['To'] = to_email
    msg['Subject'] = subject

    msg.attach(MIMEText(html_body, 'html'))

    try:
        server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT)
        server.starttls()
        server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
        server.send_message(msg)
        server.quit()
        print(f"Email successfully sent to {to_email}")
    except Exception as e:
        print(f"ERROR: Failed to send email to {to_email}: {e}")

def send_reset_password_email(to_email: str, reset_token: str):
    """Generates the HTML template and starts the background email thread."""
    reset_link = f"{settings.FRONTEND_URL}/reset-password?token={reset_token}"
    
    html_content = f"""
    <html>
      <body style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #8b5cf6;">PrecisionFlow Password Reset</h2>
        <p>You requested a password reset for your PrecisionFlow account.</p>
        <p>Please click the button below to choose a new password. This link will expire in 15 minutes.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="{reset_link}" style="background-color: #8b5cf6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reset Password</a>
        </div>
        <p>If you did not request this, you can safely ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
        <p style="font-size: 12px; color: #888;">PrecisionFlow Team<br/>If the button doesn't work, copy and paste this link into your browser: <br/>{reset_link}</p>
      </body>
    </html>
    """
    
    thread = threading.Thread(target=_send_email_async, args=(to_email, "Reset your PrecisionFlow Password", html_content))
    thread.start()
