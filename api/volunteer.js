import { getSupabase } from './_lib/supabase.js';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { name, email, phone, interest, message } = req.body;

        if (!name || !email) {
            return res.status(400).json({ error: 'Name and email are required' });
        }

        const supabase = getSupabase();
        const { data, error } = await supabase.from('volunteers').insert([
            {
                name,
                email,
                phone: phone || null,
                interest: interest || null,
                message: message || null,
            },
        ]).select();

        if (error) {
            console.error('Supabase volunteer insert error:', error);
            return res.status(500).json({ error: 'Failed to save signup' });
        }

        console.log('New volunteer signup:', name, email);
        res.json({ success: true, data });
    } catch (err) {
        console.error('Volunteer endpoint error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}
