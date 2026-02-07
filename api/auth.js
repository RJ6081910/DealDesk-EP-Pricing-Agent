export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  // Each user stored as "email:password" in separate env vars
  const userEntries = [
    process.env.AUTH_USER_1,
    process.env.AUTH_USER_2
  ].filter(Boolean);

  const normalizedEmail = email.toLowerCase().trim();

  const match = userEntries.some(entry => {
    const separatorIndex = entry.indexOf(':');
    if (separatorIndex === -1) return false;
    const userEmail = entry.slice(0, separatorIndex).toLowerCase().trim();
    const userPassword = entry.slice(separatorIndex + 1);
    return userEmail === normalizedEmail && userPassword === password;
  });

  if (match) {
    return res.status(200).json({ success: true, email: normalizedEmail });
  }

  return res.status(401).json({ error: 'Invalid email or password' });
}
