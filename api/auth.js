export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  // Users stored as JSON in env var: [{"email":"...","password":"..."},...]
  let users = [];
  try {
    users = JSON.parse(process.env.AUTH_USERS || '[]');
  } catch {
    console.error('Failed to parse AUTH_USERS env var');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  const match = users.find(
    u => u.email === email.toLowerCase().trim() && u.password === password
  );

  if (match) {
    return res.status(200).json({ success: true, email: match.email });
  }

  return res.status(401).json({ error: 'Invalid email or password' });
}
