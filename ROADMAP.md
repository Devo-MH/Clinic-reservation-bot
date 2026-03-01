# ClinicBot — Product Roadmap

## Vision
WhatsApp-first appointment automation for clinics. Egypt launch → Gulf expansion.

## Business Decisions (Locked)
- **Launch market:** Egypt first, Gulf at Month 6+
- **Trial:** 14 days, no credit card required
- **After trial:** Account pauses (bot stops), data kept 30 days then purged
- **Billing:** Monthly only (annual plans after 50+ clients)
- **Refunds:** No refunds after first charge
- **Limits enforcement:** 10% grace period over limit, then soft block
- **Support:** WhatsApp (dogfood the product)

---

## Pricing

### Egypt (EGP)
| Tier    | Price     | Doctors | Appts/mo |
|---------|-----------|---------|----------|
| STARTER | 399 EGP   | 1       | 150      |
| SOLO    | 699 EGP   | 1       | 500      |
| GROWTH  | 999 EGP   | 5       | 1,000    |
| CLINIC  | 1,999 EGP | ∞       | ∞        |

### Gulf — Phase 5 (SAR)
| Tier    | Price    | Doctors | Appts/mo |
|---------|----------|---------|----------|
| STARTER | 99 SAR   | 1       | 150      |
| SOLO    | 179 SAR  | 1       | 500      |
| GROWTH  | 299 SAR  | 5       | 1,000    |
| CLINIC  | 599 SAR  | ∞       | ∞        |

---

## Payment Methods

### Egypt
- **InstaPay** — manual at first (transfer → you activate), automate later
- **PayMob** — card payments (Visa/Mastercard) + Fawry + Valu
- **Fawry** — cash at kiosks (via PayMob)

### Gulf (Phase 5)
- **Moyasar** — SAR/AED/KWD card payments

---

## Build Roadmap

### Phase 1 — Retention ✅ Done
> Highest impact on keeping clinics happy

- [x] 24h appointment reminder cron job
- [x] 2h appointment reminder cron job
- [x] Appointment reschedule flow
- [x] Trial expiry warning (Day 12 WhatsApp to clinic owner)
- [x] Subscription limit enforcement (soft block at 110%)
- [x] Cancel reminders when appointment is cancelled

---

### Phase 2 — Clinic Dashboard
> Doctors need to see and manage their calendar

- [ ] Auth (email + password for clinic admin)
- [ ] Appointment calendar view (day/week)
- [ ] Doctor & service management (CRUD)
- [ ] Basic analytics (appts this month, cancellation rate)
- [ ] Manual appointment creation from dashboard

---

### Phase 3 — Onboarding & Payments
> Remove manual onboarding, start collecting money

- [ ] Landing page (Arabic, Egypt-focused)
- [ ] Embedded Signup (Meta OAuth → auto-create tenant)
- [ ] InstaPay manual activation flow
- [ ] PayMob integration (cards + Fawry)
- [ ] Subscription management (upgrade/downgrade/cancel)
- [ ] Trial-to-paid conversion flow
- [ ] Invoice generation (PDF, Arabic)

---

### Phase 4 — Egypt Go-to-Market
> Product-market fit in Egypt

- [ ] Egyptian Arabic dialect tuning for AI prompts
- [ ] Egypt-specific onboarding (working days Mon–Fri awareness)
- [ ] WhatsApp support channel setup
- [ ] Referral program ("refer a clinic, get 1 month free")
- [ ] Testimonials & social proof collection

---

### Phase 5 — Gulf Expansion (Month 6+)
> Proven product, enter higher-value market

- [ ] SAR/AED/KWD pricing tiers
- [ ] Moyasar payment integration
- [ ] Gulf Arabic dialect tuning
- [ ] Gulf-focused landing page
- [ ] Sun–Thu working week as default for Gulf tenants

---

### Phase 6 — Growth Features
> Retention and differentiation

- [ ] Waitlist management ("slot full → join waitlist?")
- [ ] Post-appointment feedback (1–5 star rating via WhatsApp)
- [ ] Google Calendar sync for doctors
- [ ] Doctor-specific booking link (yourdomain.com/dr/name)
- [ ] Multi-language per patient (AR/EN auto-detect)
- [ ] Annual billing with 2-months-free discount
- [ ] Admin super-dashboard (all tenants, MRR, churn)

---

## Schema Changes Needed (Phase 1 prep)
```prisma
model Tenant {
  country  String @default("EG")  // EG, SA, AE, KW, QA
  currency String @default("EGP") // EGP, SAR, AED, KWD, QAR
}
```

---

## Key Metrics to Track
- Trial → Paid conversion rate (target: >30%)
- Monthly churn (target: <5%)
- Appointments booked via bot vs manually
- Average appts/clinic/month (upgrade triggers)
