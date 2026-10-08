# STYLEMIRA AI — VERCEL PRODUCTION ENVIRONMENT CONFIGURATION

This document provides the exact variable deployment schema for **Vercel** across **Development**, **Preview**, and **Production** environments.

---

## 1. Environment Variable Scopes in Vercel

In the Vercel Project Settings (`Settings > Environment Variables`), configure the variables according to their environment target:

| Variable Name | Client / Server | Development | Preview | Production | Description |
|---|---|:---:|:---:|:---:|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Public (Client + Server) | ✓ | ✓ | ✓ | Supabase project URL (`https://xyz.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public (Client + Server) | ✓ | ✓ | ✓ | Supabase public anon key with RLS |
| `VITE_SUPABASE_URL` | Public (Client + Server) | ✓ | ✓ | ✓ | Vite compatibility alias for Supabase URL |
| `VITE_SUPABASE_ANON_KEY` | Public (Client + Server) | ✓ | ✓ | ✓ | Vite compatibility alias for Anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | **Server-Side Only** | ✓ | ✓ | ✓ | Supabase admin secret (Bypasses RLS) |
| `GEMINI_API_KEY` | Server / Function | ✓ | ✓ | ✓ | Google Gemini 1.5 Pro & Multimodal Vision |
| `VITE_GEMINI_API_KEY` | Client Proxy / Direct | ✓ | ✓ | ✓ | Gemini API key for styling requests |
| `REPLICATE_API_TOKEN` | Server / Function | ✓ | ✓ | ✓ | Replicate API token for IDM-VTON |
| `VITE_REPLICATE_API_TOKEN` | Client Proxy | ✓ | ✓ | ✓ | Virtual try-on token |
| `RUNWAY_API_KEY` | Server / Function | ✓ | ✓ | ✓ | Runway Gen-3 Alpha video synthesis key |
| `VITE_RUNWAY_API_KEY` | Client Proxy | ✓ | ✓ | ✓ | Runway video generation key |
| `RESEND_API_KEY` | Server / Function | ✓ | ✓ | ✓ | Transactional email provider key |
| `VITE_RESEND_API_KEY` | Client / Function | ✓ | ✓ | ✓ | Email client key |
| `EMAIL_FROM` | Server / Function | ✓ | ✓ | ✓ | Verified sending domain address |
| `ADMIN_NOTIFICATION_EMAIL` | Server / Function | ✓ | ✓ | ✓ | Admin alert recipient (`farzunmir@gmail.com`) |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Public (Client) | ✓ (Test) | ✓ (Test) | ✓ (Live) | Stripe publishable key (`pk_live_...`) |
| `STRIPE_SECRET_KEY` | **Server-Side Only** | ✓ (Test) | ✓ (Test) | ✓ (Live) | Stripe secret key (`sk_live_...`) |
| `STRIPE_WEBHOOK_SECRET` | **Server-Side Only** | ✓ (Test) | ✓ (Test) | ✓ (Live) | Stripe webhook verification secret |
| `VITE_APP_URL` | Public | `http://localhost:5173` | `$VERCEL_URL` | `https://stylemira.ai` | Canonical application URL |

---

## 2. Server-Side Secret Protection Architecture

1. **Client Exposure Prohibition:**
   - Secrets (`SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`) must **never** be prefixed with `VITE_` or `NEXT_PUBLIC_`.
   - Browser code only communicates with public endpoints and public anonymous keys secured by Supabase Row Level Security (RLS).

2. **Connection Test Diagnostics:**
   - The Admin Diagnostic panel (`Studio Admin > API Providers`) runs live probes and returns statuses (`CONNECTED`, `NOT CONFIGURED`, `INVALID CREDENTIAL`, `PROVIDER UNAVAILABLE`, `PROVIDER ERROR`) without printing or echoing the secrets to the DOM or console.

---

## 3. How to Deploy on Vercel

```bash
# 1. Install Vercel CLI (if not installed)
npm i -g vercel

# 2. Link your project
vercel link

# 3. Pull environment variables or set them in Dashboard
vercel env pull .env.production.local

# 4. Deploy to Production
vercel --prod
```
