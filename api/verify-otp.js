
import twilio from 'twilio';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { phone, code } = req.body;
  
  if (!phone || !code) {
    return res.status(400).json({ success: false, message: 'Phone and code are required' });
  }

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

  if (!accountSid || !authToken || !serviceSid) {
    return res.status(500).json({ success: false, message: 'Server misconfiguration' });
  }

  try {
    const client = twilio(accountSid, authToken);
    
    const verificationCheck = await client.verify.v2.services(serviceSid)
      .verificationChecks
      .create({ to: phone, code: code });

    const isValid = verificationCheck.status === 'approved';

    return res.status(200).json({ success: true, valid: isValid });
  } catch (error) {
    console.error('Twilio Check Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
}
