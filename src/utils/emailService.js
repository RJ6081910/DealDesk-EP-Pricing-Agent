export const sendProposalEmail = async (to, subject, textContent) => {
  const apiKey = import.meta.env.VITE_RESEND_API_KEY;

  if (!apiKey) {
    throw new Error('Resend API key not configured. Add VITE_RESEND_API_KEY to your .env file.');
  }

  const response = await fetch('/api/send-email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      from: 'LinkedIn EP Agent <onboarding@resend.dev>',
      to: [to],
      subject,
      text: textContent
    })
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || `Failed to send email (${response.status})`);
  }

  return response.json();
};
