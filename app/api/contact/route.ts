import { NextRequest, NextResponse } from "next/server";
import { getInquiryModel } from "@/models";
import nodemailer from "nodemailer";

// GET all inquiries (for admin)
export async function GET(req: NextRequest) {
  try {
    const InquiryModel = await getInquiryModel();
    const inquiries = await InquiryModel.find({}).sort({ createdAt: -1 }).toArray();
    return NextResponse.json({ success: true, inquiries });
  } catch (error) {
    console.error("Error fetching inquiries:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch inquiries" }, { status: 500 });
  }
}

// POST create a new inquiry
export async function POST(req: NextRequest) {
  try {
    const { name, email, subject, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json({ success: false, message: "Name, email and message are required" }, { status: 400 });
    }

    const InquiryModel = await getInquiryModel();

    const now = new Date();
    const newInquiry = {
      name,
      email,
      subject: subject || "No Subject",
      message,
      status: "unread", // Default status
      createdAt: now,
      updatedAt: now,
    };

    const result = await InquiryModel.insertOne(newInquiry);

    // Send email using Nodemailer
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || "465"),
        secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      const htmlTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>New Inquiry</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,400&family=Inter:wght@300;400;500&display=swap');
          
          body { 
            font-family: 'Inter', sans-serif; 
            background-color: #FAFAFA; 
            margin: 0; 
            padding: 40px 0; 
            color: #2D3748;
          }
          .container { 
            max-width: 650px; 
            margin: 0 auto; 
            background-color: #FFFFFF; 
            border: 1px solid #EAEAEA;
            box-shadow: 0 20px 40px rgba(0,0,0,0.03); 
          }
          .header { 
            background-color: #063A1D; 
            padding: 45px 40px; 
            text-align: center; 
            border-bottom: 4px solid #98c45f;
          }
          .header h1 { 
            color: #FFFFFF; 
            margin: 0; 
            font-family: 'Cormorant Garamond', serif;
            font-size: 36px; 
            font-weight: 600; 
            letter-spacing: 2px;
            text-transform: uppercase;
          }
          .header p { 
            color: #98c45f; 
            margin: 10px 0 0 0; 
            font-size: 13px; 
            letter-spacing: 4px;
            text-transform: uppercase;
            font-weight: 500;
          }
          .content { 
            padding: 50px 50px; 
          }
          .greeting {
            font-family: 'Cormorant Garamond', serif;
            font-size: 26px;
            color: #063A1D;
            margin-bottom: 35px;
            font-style: italic;
          }
          .field { 
            margin-bottom: 30px; 
          }
          .field-label { 
            font-size: 11px; 
            text-transform: uppercase; 
            letter-spacing: 2px; 
            color: #718096; 
            font-weight: 600; 
            margin-bottom: 8px; 
          }
          .field-value { 
            font-size: 16px; 
            color: #1A202C; 
            line-height: 1.6; 
            font-weight: 400;
            border-bottom: 1px solid #F0F0F0;
            padding-bottom: 15px;
          }
          .field-value a {
            color: #063A1D;
            text-decoration: none;
            font-weight: 500;
          }
          .message-box { 
            font-size: 15px; 
            color: #2D3748; 
            line-height: 1.8; 
            white-space: pre-wrap; 
            font-family: 'Inter', sans-serif;
            background: #F9FAFB;
            padding: 25px;
            border-left: 3px solid #98c45f;
            margin-top: 10px;
          }
          .footer { 
            padding: 40px; 
            text-align: center; 
            background-color: #063A1D;
          }
          .footer h2 {
            font-family: 'Cormorant Garamond', serif;
            color: #FFFFFF;
            font-size: 22px;
            margin: 0 0 10px 0;
            letter-spacing: 1px;
          }
          .footer p { 
            margin: 0; 
            font-size: 12px; 
            color: #A0AEC0; 
            line-height: 1.6;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Nestcraft Living</h1>
            <p>Exclusive Inquiry</p>
          </div>
          <div class="content">
            <div class="greeting">
              You have received a new inquiry from a valued client.
            </div>
            
            <div class="field">
              <div class="field-label">Client Name</div>
              <div class="field-value">${name}</div>
            </div>
            
            <div class="field">
              <div class="field-label">Contact Email</div>
              <div class="field-value">
                <a href="mailto:${email}">${email}</a>
              </div>
            </div>
            
            <div class="field">
              <div class="field-label">Inquiry Subject</div>
              <div class="field-value">${newInquiry.subject}</div>
            </div>
            
            <div class="field">
              <div class="field-label">Message Details</div>
              <div class="message-box">${message.replace(/\\n/g, '<br>').replace(/\\*\\*(.*?)\\*\\*:/g, '<strong style="color:#063A1D; font-size:12px; text-transform:uppercase; letter-spacing:1px;">$1:</strong><br>')}</div>
            </div>
          </div>
          <div class="footer">
            <h2>Nestcraft Living</h2>
            <p>Premium Furniture & Design Consultants<br>
            This is an automated notification from your website.</p>
          </div>
        </div>
      </body>
      </html>
      `;

      const mailOptions = {
        from: `"Nestcraft Notifications" <${process.env.SMTP_USER}>`, 
        replyTo: email,
        to: process.env.CONTACT_RECIPIENTS?.split(",").map(e => e.trim()) || process.env.SMTP_USER,
        subject: `New Contact Inquiry: ${newInquiry.subject}`,
        text: `You have received a new inquiry from ${name} (${email}).\n\nMessage:\n${message.replace(/<br>/g, '\n')}`,
        html: htmlTemplate,
      };

      await transporter.sendMail(mailOptions);
    } catch (emailError) {
      console.error("Failed to send email notification:", emailError);
      // We don't fail the request if email fails, just log it, since it's saved in DB.
    }

    return NextResponse.json({
      success: true,
      inquiry: { ...newInquiry, _id: result.insertedId }
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating inquiry:", error);
    return NextResponse.json({ success: false, error: "Failed to send message" }, { status: 500 });
  }
}
