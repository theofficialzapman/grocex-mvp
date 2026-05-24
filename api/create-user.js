import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  const supabaseAdmin = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    const { data: { user }, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name,
        must_change_password: true,
      },
    });

    if (createError) {
      return res.status(400).json({ error: createError.message });
    }

    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({ id: user.id, name, email, role: 'assignee' });

    if (profileError) {
      await supabaseAdmin.auth.admin.deleteUser(user.id);
      return res.status(400).json({ error: profileError.message });
    }

    // Send welcome email via EmailJS
    try {
      await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_id: 'service_i8xrzcs',
          template_id: 'template_z6aa8y8',
          user_id: 'Ri3hxSU2HegLFYmPw',
          template_params: {
            assignee_name: name,
            assignee_email: email,
            task_item: 'Welcome to Grocex',
            task_action: `Your login email is: ${email} — Your temporary password is: ${password}`,
            task_due_date: 'Please log in and change your password immediately.',
            task_notes: 'Visit grocex-mvp.vercel.app/login to get started.',
            store_name: 'Grocex Admin',
          },
        }),
      });
    } catch {
      // Email failed but user was created — not a blocker
    }

    return res.status(200).json({ success: true, userId: user.id });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}
