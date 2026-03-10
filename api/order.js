import { getSupabase } from './_lib/supabase.js';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { name, email, phone, item, option, address } = req.body;

        if (!name || !email || !item || !address) {
            return res.status(400).json({ error: 'Name, email, item, and address are required' });
        }

        const supabase = getSupabase();
        const { data, error } = await supabase.from('swag_orders').insert([
            {
                name,
                email,
                phone: phone || null,
                item,
                option: option || null,
                address,
                status: 'pending',
            },
        ]).select();

        if (error) {
            console.error('Supabase order insert error:', error);
            return res.status(500).json({ error: 'Failed to save order' });
        }

        console.log('New swag order:', name, item, option);
        res.json({ success: true, data });
    } catch (err) {
        console.error('Order endpoint error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}
