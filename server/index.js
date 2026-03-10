require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const Stripe = require('stripe');

const app = express();
const PORT = process.env.PORT || 4000;

// ---------------------------------------------------------------------------
// Stripe webhook needs raw body, so we mount it BEFORE the JSON parser
// ---------------------------------------------------------------------------
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

app.post(
  '/api/webhook',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    if (!stripe) return res.status(500).json({ error: 'Stripe not configured' });

    const sig = req.headers['stripe-signature'];
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      try {
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
);

// ---------------------------------------------------------------------------
// Standard middleware
// ---------------------------------------------------------------------------
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://keytonforsenate.com',
  'https://www.keytonforsenate.com',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // Be permissive during early launch
      }
    },
    credentials: true,
  })
);

app.use(express.json());

// ---------------------------------------------------------------------------
// Supabase client
// ---------------------------------------------------------------------------
const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || ''
);

// ---------------------------------------------------------------------------
// Health check
// ---------------------------------------------------------------------------
app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'Mel Keyton Campaign API' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ---------------------------------------------------------------------------
// POST /api/volunteer — Save volunteer signup
// ---------------------------------------------------------------------------
app.post('/api/volunteer', async (req, res) => {
  try {
    const { name, email, phone, interest, message } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

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
});

// ---------------------------------------------------------------------------
// POST /api/order — Save swag order
// ---------------------------------------------------------------------------
app.post('/api/order', async (req, res) => {
  try {
    const { name, email, phone, item, option, address } = req.body;

    if (!name || !email || !item || !address) {
      return res
        .status(400)
        .json({ error: 'Name, email, item, and address are required' });
    }

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
});

// ---------------------------------------------------------------------------
// POST /api/donate — Create Stripe Checkout session
// ---------------------------------------------------------------------------
app.post('/api/donate', async (req, res) => {
  if (!stripe) {
    return res.status(500).json({ error: 'Stripe not configured' });
  }

  try {
    const { amount, name, email } = req.body;
    const amountCents = Math.round(Number(amount) * 100);

    if (!amountCents || amountCents < 100) {
      return res.status(400).json({ error: 'Minimum donation is $1.00' });
    }

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
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}?donated=true`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}?donated=cancelled`,
      customer_email: email || undefined,
    });

    // Save pending donation to Supabase
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
});

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------
app.listen(PORT, () => {
  console.log(`🟢 Mel Keyton Campaign API running on port ${PORT}`);
  console.log(`   Supabase: ${process.env.SUPABASE_URL ? '✅ configured' : '❌ not set'}`);
  console.log(`   Stripe:   ${process.env.STRIPE_SECRET_KEY ? '✅ configured' : '❌ not set'}`);
});
