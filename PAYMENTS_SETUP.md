# Real payments — money to your bank account

CineVerse no longer uses fake/simulated checkout. You must configure **Razorpay** (India) or **Stripe** (international).

## Option A: Razorpay (recommended for India — INR → your bank)

1. Create a free account at [https://dashboard.razorpay.com](https://dashboard.razorpay.com)
2. Complete **KYC** and link your **bank account** for settlements
3. Go to **Settings → API Keys** → Generate **Test** or **Live** keys
4. Add to `backend/.env`:

```env
RAZORPAY_KEY_ID=rzp_test_xxxxxxxx
RAZORPAY_KEY_SECRET=your_secret_here
PAYMENT_CURRENCY=INR
```

5. Restart the backend
6. Customers pay via UPI / card / netbanking in the Razorpay popup
7. Money appears in your Razorpay balance, then **settles to your bank** (T+2 days on live mode)

### Test card (Razorpay test mode)

- Use test keys and Razorpay test cards from their docs

---

## Option B: Stripe (USD / international cards)

1. Create account at [https://dashboard.stripe.com](https://dashboard.stripe.com)
2. Add bank account for **payouts**
3. Add to `backend/.env`:

```env
STRIPE_SECRET_KEY=sk_test_xxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxx
PAYMENT_CURRENCY=USD
FRONTEND_URL=http://localhost:5173
```

4. For production webhooks, point Stripe to:
   `https://your-domain.com/api/payments/webhook/stripe`

5. Restart backend — checkout redirects to Stripe hosted page

---

## Ticket QR scanner (theatre entry)

After a **real** payment, the customer gets a ticket ID like `TKT-482910`.

**Admin:** `/admin/scanner`  
**Theatre owner:** `/theatre-owner/scanner`

- Scan QR with camera or type ticket ID manually
- Only **completed** payments show as valid
- First scan marks ticket as used

---

## Priority

If **both** Razorpay and Stripe keys are set, **Razorpay is used first**.

Remove placeholder values like `your_razorpay_key_id` from `.env` or the server will think payments are not configured.
