import smtplib
import os
from email.message import EmailMessage
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.application import MIMEApplication

def send_email(subject: str, html_body: str, attachment_bytes: bytes = None, attachment_name: str = None):
    """
    Sends an email using Gmail SMTP.
    Requires GMAIL_ADDRESS and GMAIL_APP_PASSWORD environment variables.
    """
    sender_email = os.getenv("GMAIL_ADDRESS")
    sender_password = os.getenv("GMAIL_APP_PASSWORD")
    recipient_email = "antonymittul@gmail.com"

    if not sender_email or not sender_password:
        print("Warning: GMAIL_ADDRESS or GMAIL_APP_PASSWORD not set. Email not sent.")
        return False

    msg = MIMEMultipart()
    msg['Subject'] = subject
    msg['From'] = f"Momentum App <{sender_email}>"
    msg['To'] = recipient_email

    # Add HTML body
    msg.attach(MIMEText(html_body, 'html'))

    # Add attachment if provided
    if attachment_bytes and attachment_name:
        part = MIMEApplication(attachment_bytes, Name=attachment_name)
        part['Content-Disposition'] = f'attachment; filename="{attachment_name}"'
        msg.attach(part)

    try:
        # Use TLS
        with smtplib.SMTP('smtp.gmail.com', 587) as server:
            server.ehlo()
            server.starttls()
            server.login(sender_email, sender_password)
            server.send_message(msg)
        return True
    except Exception as e:
        print(f"Failed to send email: {e}")
        return False
