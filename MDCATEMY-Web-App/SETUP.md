# MDCATEMY Landing Page — Setup Guide

## One-time setup

```bash
cd mdcatemy-landing
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Before you run: Add Hayan's photo

Place your photo at:

```
public/images/hayan.jpg
```

The photo you uploaded is the correct one (black shalwar kameez, arms crossed). Just save it as `hayan.jpg` inside the `public/images/` folder.

---

## Before you run: Update contact details

In `components/sections/Contact.tsx`, replace:
- `info@mdcatemy.com` with your real email address
- `https://wa.me/923000000000` with your real WhatsApp link (`https://wa.me/92XXXXXXXXXX`)

In `components/ui/Footer.tsx`, update the social media links to your real Instagram, YouTube, and Twitter handles.

---

## Tech stack

- **Next.js 14** (App Router)
- **Tailwind CSS** for styling
- **Framer Motion** for all animations
- **TypeScript** throughout

---

## What's built

| Section | File |
|---|---|
| Sticky Navbar with mobile menu | `components/ui/Navbar.tsx` |
| Hero with YouTube modal (video ID: qk93OJhJJbk) | `components/sections/Hero.tsx` |
| Social proof + infinite testimonial marquee | `components/sections/SocialProof.tsx` |
| Pain point editorial article | `components/sections/PainPoint.tsx` |
| The System + live dashboard mockup | `components/sections/TheSystem.tsx` |
| Tribe details + pricing cards | `components/sections/Pricing.tsx` |
| 14-day guarantee callout | `components/sections/Guarantee.tsx` |
| Meet the Architect (Hayan) + timeline | `components/sections/Architect.tsx` |
| FAQ accordion (fully animated) | `components/sections/FAQ.tsx` |
| Scholarship section | `components/sections/Scholarship.tsx` |
| Contact (email + WhatsApp) | `components/sections/Contact.tsx` |
| Footer with links + socials | `components/ui/Footer.tsx` |

---

## Customization notes

- All pricing is set in `components/sections/Pricing.tsx`
- Testimonials can be updated in `components/sections/SocialProof.tsx`
- FAQ answers are in `components/sections/FAQ.tsx`
- Colors are defined in `tailwind.config.ts` and `app/globals.css`
- The tribal background SVG is at `public/images/tribal-bg.svg`

---

## Building for production

```bash
npm run build
npm start
```
