
import twilio from 'twilio';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { phone } = req.body;
  
  if (!phone) {
    return res.status(400).json({ success: false, message: 'Phone number is required' });
  }

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

  if (!accountSid || !authToken || !serviceSid) {
    return res.status(500).json({ success: false, message: 'Server misconfiguration' });
  }

  try {
    const client = twilio(accountSid, authToken);
    
    const verification = await client.verify.v2.services(serviceSid)
      .verifications
      .create({ to: phone, channel: 'sms' });

    return res.status(200).json({ success: true, status: verification.status });
  } catch (error) {
    console.error('Twilio Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
}
