import { getSupabase } from './_lib/supabase.js';
import Stripe from 'stripe';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
        return res.status(503).json({
            error: 'Stripe is not configured yet. The campaign owner needs to add Stripe API keys.',
        });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    try {
        const { amount, name, email } = req.body;
        const amountCents = Math.round(Number(amount) * 100);

        if (!amountCents || amountCents < 100) {
            return res.status(400).json({ error: 'Minimum donation is $1.00' });
        }

        const frontendUrl = process.env.FRONTEND_URL || 'https://keytonforsenate.com';

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: 'Donation to Mel Keyton for Senate D28',
                            description: 'Campaign contribution',
                        },
                        unit_amount: amountCents,
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${frontendUrl}?donated=true`,
            cancel_url: `${frontendUrl}?donated=cancelled`,
            customer_email: email || undefined,
        });

        // Save pending donation to Supabase
        const supabase = getSupabase();
        await supabase.from('donations').insert([
            {
                name: name || 'Anonymous',
                email: email || null,
                amount_cents: amountCents,
                stripe_session_id: session.id,
                status: 'pending',
            },
        ]);

        console.log('Stripe checkout session created:', session.id);
        res.json({ url: session.url, sessionId: session.id });
    } catch (err) {
        console.error('Donate endpoint error:', err);
        res.status(500).json({ error: 'Failed to create checkout session' });
    }
}
