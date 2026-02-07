export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Resend API key not configured' });
  }

  const { from, to, subject, text } = req.body || {};
  if (!to || !subject || !text) {
    return res.status(400).json({ error: 'to, subject, and text are required' });
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        from: from || 'LinkedIn EP Agent <onboarding@resend.dev>',
        to: Array.isArray(to) ? to : [to],
        subject,
        text
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.message || `Resend API error (${response.status})`
      });
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error('Send email error:', err);
    return res.status(500).json({ error: 'Failed to send email' });
  }
}
