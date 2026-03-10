import { getSupabase } from './_lib/supabase.js';
import Stripe from 'stripe';

// Vercel needs raw body for Stripe webhook signature verification
export const config = {
    api: {
        bodyParser: false,
    },
};

function getRawBody(req) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        req.on('data', (chunk) => chunks.push(chunk));
        req.on('end', () => resolve(Buffer.concat(chunks)));
        req.on('error', reject);
    });
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
        return res.status(503).json({ error: 'Stripe not configured' });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const sig = req.headers['stripe-signature'];

    let event;
    try {
        const rawBody = await getRawBody(req);
        event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        try {
            const supabase = getSupabase();
            await supabase
                .from('donations')
                .update({ status: 'completed' })
                .eq('stripe_session_id', session.id);
            console.log('Donation marked completed:', session.id);
        } catch (err) {
            console.error('Error updating donation:', err);
        }
    }

    res.json({ received: true });
}
