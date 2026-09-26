import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { to, subject, html, text, secret } = req.body || {};

    if (secret !== 'diwani_mahall_mailer_secure_2026') {
      return res.status(401).json({ error: 'Unauthorized mail relay request' });
    }

    if (!to || !subject) {
      return res.status(400).json({ error: 'Missing recipient (to) or subject' });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'teemdiwani@gmail.com',
        pass: 'wdgpciybjxroiyat',
      },
    });

    const info = await transporter.sendMail({
      from: 'MahallConnect <teemdiwani@gmail.com>',
      to,
      subject,
      text: text || '',
      html: html || text || '',
    });

    return res.status(200).json({
      success: true,
      messageId: info.messageId,
      accepted: info.accepted,
      response: info.response,
    });
  } catch (error) {
    console.error('Nodemailer error in Vercel mail relay:', error);
    return res.status(500).json({
      success: false,
      error: error.message || String(error),
    });
  }
}
