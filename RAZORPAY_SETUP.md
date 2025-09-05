# Razorpay Integration Setup

## Security Best Practices

This project follows security best practices for Razorpay integration:

### ✅ **What's Secure:**
- **Public Key** (`NEXT_PUBLIC_RAZORPAY_KEY_ID`) - Safe to expose in frontend code
- **Secret Key** (`RAZORPAY_KEY_SECRET`) - Only used in server-side API routes
- **Webhook Secret** (`RAZORPAY_WEBHOOK_SECRET`) - Only used in server-side verification

### 🔒 **Security Implementation:**

1. **Frontend (Client-Side):**
   - Only uses the public key (`NEXT_PUBLIC_RAZORPAY_KEY_ID`)
   - No access to secret keys
   - Cannot create orders or verify payments directly

2. **Backend (Server-Side API Routes):**
   - `/api/payments/create-order` - Creates Razorpay orders using secret key
   - `/api/payments/verify` - Verifies payment signatures using secret key
   - Both routes use `export const runtime = "nodejs"` for security

## Environment Variables

### Required Environment Variables:

```bash
# Public key - exposed to frontend
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_your_key_id

# Private keys - only used on server
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_secret_key
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
```

### Setup Steps:

1. **Copy environment variables:**
   ```bash
   cp .env.example .env.local
   ```

2. **Get your Razorpay credentials:**
   - Login to [Razorpay Dashboard](https://dashboard.razorpay.com/)
   - Go to Settings > API Keys
   - Copy Key ID and Key Secret

3. **Update .env.local with your credentials:**
   ```bash
   NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_your_actual_key_id
   RAZORPAY_KEY_ID=rzp_test_your_actual_key_id  
   RAZORPAY_KEY_SECRET=your_actual_secret_key
   RAZORPAY_WEBHOOK_SECRET=your_actual_webhook_secret
   ```

4. **Never commit .env.local to version control** - it's already in .gitignore

## Payment Flow

### Secure Payment Process:

1. **Frontend initiates checkout** with cart items and shipping info
2. **API creates Razorpay order** using secret key on server
3. **Frontend receives order details** (no sensitive data)
4. **Razorpay popup opens** using public key and order ID
5. **Payment completed** by user in Razorpay popup
6. **API verifies payment signature** using secret key on server
7. **Order status updated** in database after successful verification

### Key Security Features:

- ✅ Secret keys never exposed to frontend
- ✅ Order creation happens on secure server
- ✅ Payment verification uses cryptographic signatures
- ✅ All sensitive operations are server-side only
- ✅ Environment variables are properly scoped

## Deployment Considerations

### For Production:

1. **Use live Razorpay keys** (replace `rzp_test_` with `rzp_live_`)
2. **Set environment variables** in your deployment platform
3. **Enable webhooks** for automated payment status updates
4. **Monitor payment logs** through Razorpay dashboard

### Security Checklist:

- [ ] Secret keys are not in frontend code
- [ ] .env files are in .gitignore
- [ ] API routes use Node.js runtime
- [ ] Payment verification uses server-side signature checking
- [ ] Environment variables are properly configured
