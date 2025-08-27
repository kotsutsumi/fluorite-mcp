// Minimal Stripe webhook verify demo (synthetic, no server)
// Env: STRIPE_API_KEY, STRIPE_WEBHOOK_SECRET, STRIPE_SIG (optional)
// Run: npx tsx examples/pack-examples/stripe/index.ts
import Stripe from 'stripe';

async function main(){
  const apiKey = process.env.STRIPE_API_KEY || '';
  const secret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_xxx';
  const sig = process.env.STRIPE_SIG || '';
  const stripe = new Stripe(apiKey, { apiVersion: '2024-06-20' as any });
  const payload = JSON.stringify({ type: 'test.event', id: 'evt_123' });
  try {
    // This will throw if signature is invalid (which is expected unless STRIPE_SIG is valid)
    stripe.webhooks.constructEvent(payload, sig, secret);
    console.log('ok');
  } catch (e) {
    console.log('signature invalid (expected in demo)');
  }
}

main().catch((e)=>{ console.error(e); process.exit(1); });
