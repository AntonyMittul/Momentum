import os
import sys
import json
import smtplib
import base64
from email.message import EmailMessage
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.application import MIMEApplication

def main():
    if len(sys.argv) < 2:
        print("Missing payload")
        sys.exit(1)
        
    payload_str = sys.argv[1]
    
    try:
        data = json.loads(payload_str)
    except Exception as e:
        print(f"Failed to parse JSON: {e}")
        # Not a JSON response or failed endpoint
        sys.exit(0)
        
    if not data.get("send_email"):
        print("No email needed.")
        sys.exit(0)
        
    sender_email = os.getenv("GMAIL_ADDRESS")
    sender_password = os.getenv("GMAIL_APP_PASSWORD")
    
    if not sender_email or not sender_password:
        print("Missing GMAIL_ADDRESS or GMAIL_APP_PASSWORD in GitHub Secrets.")
        sys.exit(1)
        
    sender_password = sender_password.replace(" ", "")
    recipient_email = "antonymittul@gmail.com"

    msg = MIMEMultipart()
    msg['Subject'] = data.get("subject", "Momentum Update")
    msg['From'] = f"Momentum App <{sender_email}>"
    msg['To'] = recipient_email

    msg.attach(MIMEText(data.get("html_body", ""), 'html'))

    if data.get("attachment_base64") and data.get("attachment_name"):
        pdf_bytes = base64.b64decode(data["attachment_base64"])
        part = MIMEApplication(pdf_bytes, Name=data["attachment_name"])
        part['Content-Disposition'] = f'attachment; filename="{data["attachment_name"]}"'
        msg.attach(part)

    print("Connecting to SMTP...")
    try:
        with smtplib.SMTP_SSL('smtp.gmail.com', 465, timeout=30) as server:
            server.login(sender_email, sender_password)
            server.send_message(msg)
        print("Email sent successfully via GitHub Actions!")
    except Exception as e:
        print(f"Failed to send email: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
