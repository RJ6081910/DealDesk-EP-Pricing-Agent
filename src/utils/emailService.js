export const sendProposalEmail = async (to, subject, textContent) => {
  const response = await fetch('/api/send-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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
