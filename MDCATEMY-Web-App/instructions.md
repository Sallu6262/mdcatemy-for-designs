MDCATEMY: Software Requirements & Design DocumentConfidential 
MDCATEMY 
Software Requirements & Design Document 
Full Product Specification: Phase 1 (Current) + Phase 2 (Final Vision)   
Prepared by: Hayan Khan 
For: Claude Code + Figma MCP Design System Build 
Version 1.0  |  March 2026 
This document is the single source of truth for all design and development decisions. 
© 2026 MDCATEMY | Confidential: For Development Use Only 
MDCATEMY: Software Requirements & Design DocumentConfidential 
1. Document Overview 
1.1 Purpose 
This document is the complete Software Requirements and Design Specification for the 
MDCATemy web platform. It is intended to be handed directly to Claude Code with the Figma 
MCP plugin to generate a full design system, landing page, authentication flows, student 
dashboard, coach dashboard, and admin dashboard. 
Every section is written at maximum granularity: every component, every state, every 
interaction, every edge case is documented so that the developer or AI agent does not need to 
make assumptions. 
1.2 Two-Phase Architecture 
Phase 1 (Current: Launch) Landing page + Auth + Payment form + Minimal dashboard (Training 
Ground + Circle SSO redirect). Hosted separately from Circle 
community. 
Phase 2 (Final Vision) Full self-hosted LMS: lectures, flashcards, Study Tribe, mentor 
dashboard, admin panel, Q-bank management, score predictor. 
Everything documented in this file. 
 
ℹ  Phase 1 is what gets built first. Phase 2 documentation is included so the design system and 
architecture decisions made in Phase 1 can scale directly into Phase 2 without a redesign. 
1.3 Platform Identity 
Platform Name MDCATemy 
Domain mdcatemy.com 
Tagline Train Like a Warrior. Score Like a Legend. 
Primary Product Study Tribe: mentorship + accountability + LMS system 
Primary Audience FSc Pre-Medical students preparing for MDCAT in Pakistan 
Subjects Covered Biology, Chemistry, Physics, English, Logical Reasoning 
Batch Size 100 students per batch (limited seats) 
Unique Differentiator Study Tribe: structured mentorship, accountability, and tribe-based 
learning vs competitor lecture-dumps 
1.4 Voice and Tone Guide 
Every piece of copy on MDCATEMY speaks like a big brother who has been through the 
MDCAT war and came back. He is not a teacher talking down at you. He is not a salesman. He 
is someone who actually cares, who has sat where you are sitting right now, and who knows 
exactly what it takes to get through this. He talks straight. He is warm but never soft. He pushes 
you because he believes in you. 
© 2026 MDCATEMY | Confidential: For Development Use Only 
MDCATEMY: Software Requirements & Design DocumentConfidential 
What this sounds like in practice 
• Speak directly to the student. Use 'you' and 'your'. Never say 'students' when you can 
say 'you'. 
• Short sentences. No fluff. No corporate language. No AI-sounding constructions. 
• Use full stops, not em dashes. Break thoughts into separate sentences rather than 
chaining them together. 
• Sound human. If a real person would not say it out loud in a conversation, do not write it 
on the website. 
• Warmth is in the honesty, not in the adjectives. Do not over-compliment. Do not 
over-promise. 
• The warrior theme shows in the visual design and in the attitude, not in forced warrior 
vocabulary on every line. 
What to avoid 
• Never use double dashes like -- or long dashes like this to connect thoughts. Use a full 
stop or a comma. 
• Never write 'MDCATemy' with mixed casing. It is always MDCATEMY. 
• No buzzwords like 'comprehensive', 'holistic', 'cutting-edge', 'unlock your potential'. 
• No passive voice. Say 'we will help you' not 'students are helped by'. 
• No robotic list-speak like 'The platform provides the following functionalities'. 
Tone examples 
Wrong tone 
Right tone 
Wrong tone 
Right tone 
Wrong tone 
Our comprehensive platform provides holistic MDCAT preparation 
solutions. 
MDCATEMY gives you everything you need to prepare for MDCAT. 
Lectures, practice, a coach who checks in on you, and a tribe that 
keeps you going when things get hard. 
Limited availability -- only 100 seats per batch. 
We only take 100 students per batch. That is it. When it fills, it fills. 
Our mentorship system ensures accountability through structured 
interactions. 
Right tone 
Your coach has been through MDCAT. He knows what it feels like. 
He is going to make sure you do not fall behind. 
© 2026 MDCATEMY | Confidential: For Development Use Only 
MDCATEMY: Software Requirements & Design DocumentConfidential 
2. Design System 
This is the complete design token and component specification. Claude Code should use this to 
generate the Figma design system via the Figma MCP plugin before building any screens. 
2.1 Brand Identity & Theme 
MDCATemy is DARK THEME ONLY. No light mode exists anywhere in the platform. The entire 
UI is built on deep black and dark charcoal backgrounds with Yellow (#FFC600) as the primary 
accent. The Warrior/Tribe identity is expressed through sharp diagonal geometry, bold 
typographic weight, high contrast Yellow-on-Black compositions, and battle-flag visual structure. 
Every screen: landing page, dashboard, quiz interface, admin panel: uses the dark theme. 
There is no light mode toggle. This is a design constraint, not a preference. 
2.2 Color Palette 
Token Name Hex Value Usage 
Warrior Black #181A18 Primary background, hero sections 
Dark Charcoal #222422 Cards, elevated surfaces, navbar 
MDCATemy Yellow #FFC600 Primary CTA, hero highlights, active states 
Deep Gold #E6A800 Hover states on yellow elements 
White #FFFFFF Primary text on dark, light surface fill 
Off-White #F5F5F5 Used only for subtle input backgrounds on dark 
surfaces: NOT a light mode color 
Light Gray #F0F0F0 Used only for subtle dividers and borders on dark 
surfaces: NOT a light mode color 
Muted Text #CCCCCC Secondary text on dark 
Body Text Dark #333333 Reserved for future use: not used in Phase 1 or 
Phase 2 dark theme 
Error Red #D9534F Error states, destructive actions 
Success Green #28A745 Success states, correct answers 
Warning Amber #FFA500 Warning states, at-risk student flags 
Info Blue #0070C0 Informational callouts, links 
 
2.3 Typography 
Display / Hero Poppins Black (900): used for hero headlines, section titles, key 
numbers 
Heading H1 Poppins Bold (700): 36px / 40px line-height 
Heading H2 Poppins SemiBold (600): 28px / 34px 
© 2026 MDCATEMY | Confidential: For Development Use Only 
MDCATEMY: Software Requirements & Design DocumentConfidential 
Heading H3 Poppins SemiBold (600): 22px / 28px 
Heading H4 Poppins Medium (500): 18px / 24px 
Body Large Inter Regular (400): 18px / 28px 
Body Default Inter Regular (400): 16px / 26px 
Body Small Inter Regular (400): 14px / 22px 
Caption / Label Inter Medium (500): 12px / 18px: uppercase letter-spacing 0.06em 
Button Text Poppins SemiBold (600): 15px: uppercase letter-spacing 0.04em 
Code / Monospace JetBrains Mono: 14px: used for MCQ numbers, answer keys 
2.4 Spacing Scale 
All spacing uses a base-8 scale. The following tokens are used throughout: 4px (xs), 8px (sm), 
16px (md), 24px (lg), 32px (xl), 48px (2xl), 64px (3xl), 96px (4xl), 128px (5xl). 
2.5 Border Radius 
Sharp 0px: used for hero sections, warrior geometric shapes 
Subtle 4px: used for badges, tags, MCQ option chips 
Default 8px: used for cards, inputs, modals 
Soft 12px: used for floating panels, tooltips 
Round 9999px: used for pill buttons, avatar chips, progress bars 
2.6 Shadow / Elevation 
Level 0 (Flat) No shadow: default card on dark background 
Level 1 (Raised) 0px 2px 8px rgba(0,0,0,0.12): hover state for cards 
Level 2 (Float) 0px 8px 24px rgba(0,0,0,0.18): modals, dropdowns 
Level 3 (Overlay) 0px 16px 48px rgba(0,0,0,0.28): full-screen overlays, quiz interface 
2.6.1 Animations and Motion 
MDCATEMY is an animated, interactive website. Motion is not decoration. It is part of the 
warrior identity. Every scroll, every hover, every page transition should feel intentional and alive. 
The animation style is sharp and confident. Nothing floats gently. Things snap in, slide hard, 
pulse with energy. 
Scroll Animations 
• All sections animate in on scroll using a library like GSAP or Framer Motion. Default 
animation: fade up with a 24px Y offset. Duration 0.5s, ease-out. 
© 2026 MDCATEMY | Confidential: For Development Use Only 
MDCATEMY: Software Requirements & Design DocumentConfidential 
• Section headlines use a staggered reveal. Each word or line slides up and fades in 
80ms apart. 
• Stat numbers (trust bar, score predictor) count up from zero when scrolled into view. 
Duration 1.2s. 
• Feature cards stagger in left to right, 100ms between each card. 
Warrior Illustrations 
• Hero section background: an abstract warrior illustration built from geometric shapes and 
sharp angles. SVG-based, dark-on-dark with Yellow accents at 15 to 20 percent opacity. 
No stock illustrations. Custom geometric shapes only. 
• Tribal geometric pattern as a repeating background texture on certain sections. Very 
subtle, 5 percent opacity on dark background. Think geometric shield patterns, angular 
tribal marks. 
• Animated diagonal accent lines across section dividers. A sharp slash animation plays 
when the section enters the viewport. 
• The Study Tribe section has an animated family circle visual. 5 warrior silhouettes 
arranged in a circle, connected by thin animated lines that pulse. SVG animation, not 
video. 
Hover Interactions 
• All cards lift 4px on hover with a shadow increase. Transition 200ms ease. 
• CTA buttons have a subtle Yellow glow pulse on hover (box-shadow animation). 
• Nav links have an underline that slides in from left on hover. 
• Testimonial cards tilt slightly (2 to 3 degrees) on hover using CSS perspective transform. 
Dashboard Animations 
• Score predictor gauge needle animates from 0 to the current score on page load. 
Duration 1.5s, ease-in-out. 
• Progress rings fill up from 0 percent on first view. Duration 1s per ring, staggered 150ms. 
• MCQ options have a quick spring animation when selected (scale 1.02 then back to 1). 
• Correct answer reveal: option flashes green with a checkmark icon appearing. Duration 
300ms. 
• Wrong answer reveal: option shakes horizontally (3px left right) and turns red. Duration 
400ms. 
Page Transitions 
• Route changes use a fast fade transition (200ms). No full page reloads or jarring cuts. 
• Dashboard sidebar items slide the content area with a 150ms ease transition. 
Animation Libraries 
• Recommended: GSAP for scroll-triggered animations and complex SVG animations. 
• Framer Motion for React component-level animations (hover, tap, layout transitions). 
• Lottie for any complex warrior or tribal illustrations that need fluid animation beyond 
SVG. 
• No animation should ever feel slow or draggy. If it takes more than 600ms, it is too slow. 
© 2026 MDCATEMY | Confidential: For Development Use Only 
MDCATEMY: Software Requirements & Design DocumentConfidential 
2.7 Component Library 
ℹ  Every component below must be built in Figma with all states documented before any screen is 
assembled. 
2.7.1 Buttons 
Variant 
Specification 
Primary 
Secondary 
Ghost 
Yellow (#FFC600) fill, Black text, Poppins SemiBold. States: default / hover 
(#E6A800) / pressed (scale 0.97) / disabled (opacity 0.4) / loading (spinner 
replaces text) 
Transparent fill, Yellow border 2px, Yellow text. Same states as Primary. 
Transparent fill, no border, White or Yellow text. States: default / hover (fill White 
8% opacity) / pressed / disabled. 
Danger 
Icon Button 
Link Button 
Red (#D9534F) fill, White text. Used for destructive actions only. 
Square or circle. 40px / 48px sizes. Icon centered. All button states apply. 
No background, no border. Underline on hover. Yellow color on dark, Blue on light. 
Sizes: Small (32px height, 12px px padding), Default (44px height, 20px px padding), Large 
(52px height, 28px px padding). 
2.7.2 Input Fields 
• States: Empty, Focused (Yellow border 2px), Filled, Error (Red border + error message 
below), Disabled (40% opacity), Read-only 
• Text Input: single line, 44px height, 12px internal padding, 8px border-radius 
• Textarea: multi-line, resizable vertically only, min-height 96px 
• Select / Dropdown: custom styled, chevron icon right, opens dropdown panel with 8px 
radius shadow Level 2 
• Checkbox: 20x20px, Yellow fill when checked, custom checkmark icon 
• Radio Button: 20x20px, Yellow center dot when selected 
• Toggle / Switch: 44x24px, Yellow track when on, animated thumb slide 
• Search Input: left search icon, optional right clear (X) icon 
• File Upload: dashed border zone, drag-drop supported, file type + size shown after 
upload 
2.7.3 Cards 
• Default Card: Dark Charcoal (#222422) fill, 8px radius, 24px internal padding, Level 0 
shadow, Level 1 on hover. NO white or light fills anywhere. 
• Subject Card: icon top, title, progress bar bottom, percentage label. Click navigates to 
subject. 
• Lecture Card: thumbnail left (16:9), title, topic tag, duration, completion badge (if done) 
• MCQ Card: question text top, 4 option rows below. Option states: default (dark charcoal 
row) / selected (Yellow left border + FFC600 at 10% opacity fill) / correct (Green left 
border + green 10% fill) / incorrect (Red left border + red 10% fill) / revealed 
© 2026 MDCATEMY | Confidential: For Development Use Only 
MDCATEMY: Software Requirements & Design DocumentConfidential 
• Student Card (Coach view): avatar, name, status badge, score predictor value, 
quick-action buttons 
• Stat Card: icon, large number (Poppins Black), label below, optional trend arrow 
• Announcement Card: Yellow left-border accent, title, body text, timestamp, dismiss 
button 
2.7.4 Navigation 
• Top Navbar (Public): Logo left, nav links center, CTA button right. Sticky on scroll. 
Transparent on hero, solid Dark Charcoal after scroll threshold. 
• Top Navbar (Authenticated): Logo left, page title center, notification bell + user avatar 
right 
• Sidebar (Dashboard): 240px wide, collapsible to 64px icon-only mode on mobile. Active 
item: Yellow (#FFC600) left border 3px + Yellow at 8% opacity fill. All on dark 
background. 
• Breadcrumb: small label navigation for nested content (Subject > Chapter > Lecture) 
• Mobile Bottom Tab Bar: 5 tabs max, icon + label, Yellow active indicator 
2.7.5 Modals & Overlays 
• Modal: centered, max-width 560px, 24px padding, Level 3 shadow, dark scrim backdrop 
(60% opacity), close X top-right, ESC key closes 
• Confirm Dialog: modal variant, title + message + two buttons (Confirm Danger + Cancel 
Ghost) 
• Video Modal: full-screen or 80vw wide, dark background, close button always visible 
• Toast Notifications: bottom-right stack, 4 types: success (green), error (red), warning 
(amber), info (blue). Auto-dismiss 5s, manual close X 
• Tooltip: 8px radius, Dark Charcoal fill, White text, arrow pointer. Appears on hover/focus. 
2.7.6 Progress & Data Visualization 
• Linear Progress Bar: rounded pill, Yellow fill, gray track, percentage label right 
• Circular Progress Ring: SVG based, Yellow stroke, percentage inside, subject icon 
center 
• Score Predictor Gauge: analogue meter style, needle pointing to predicted score (0–210 
MDCAT scale), color zones: red (0–100), amber (100–150), green (150–210) 
• MCQ Stats Bar: horizontal bar showing correct % (green) / incorrect % (red) / skipped % 
(gray) 
• Streak Counter: flame icon, number, streak days label 
• Time Meter: clock icon, total hours, breakdown by activity type (lectures / MCQs / 
revision / flashcards) 
2.7.7 Badges & Tags 
• Status Badge: pill shape, color-coded: Active (green), At Risk (red), Needs Attention 
(amber), Excellent (yellow), Pending (gray) 
• Difficulty Tag: Easy (green), Medium (amber), Hard (red): small pill, used on MCQ cards 
• Subject Tag: colored by subject: Biology (green), Chemistry (blue), Physics (purple), 
English (teal), Logical Reasoning (orange) 
• Completion Badge: Yellow checkmark circle, overlays lecture thumbnail when completed 
© 2026 MDCATEMY | Confidential: For Development Use Only 
MDCATEMY: Software Requirements & Design DocumentConfidential 
• Locked Badge: padlock icon overlay, grayed-out card when content is locked 
© 2026 MDCATEMY | Confidential: For Development Use Only 
MDCATEMY: Software Requirements & Design DocumentConfidential 
3. Landing Page 
3.1 Overview & Goal 
URL 
Visible to 
Primary Goal 
Primary CTA 
mdcatemy.com 
All visitors: no login required 
Convert visitor to Study Tribe purchaser 
Join the Tribe: scrolls to Pricing section 
Design Inspiration 
Theme 
3.2 Navbar 
Ali Abdaal's Part-Time YouTuber Academy (lifestylebusiness.com): 
bold, clean, editorial feel with strong social proof 
Warrior / Tribe: dark sections, bold yellow accents, sharp geometry 
• Logo (MDCATemy wordmark): left aligned 
• Nav links: Courses | Books | Tests | About Us | Join Us 
• Pricing link: scrolls to Pricing section on landing page 
• Right side: Login button (Ghost) + Join the Tribe (Primary CTA) 
• Sticky on scroll. Transparent over hero, Dark Charcoal after scroll. 
• Mobile: hamburger menu, full-screen slide-down nav 
3.3 Section 1: Hero 
• Full-viewport height section, dark background (#181A18) 
• Main headline (Poppins Black, large, Yellow on dark): MDCAT is a War. Prepare Like a 
Warrior. 
• Sub-headline (Inter, body large, muted white): Join the tribe, get a Veteran coach and 
train with a system built to take you into a medical college. 
• Two CTAs side by side: 'Join the Tribe' (Primary Yellow) + 'See What's Inside' 
(Secondary Ghost) 
• Below CTAs: 'Limited Seats: Only 100 Warriors Per Batch' in Yellow small caps, 
letter-spaced 
• Center of section: embedded YouTube video (16:9, max-width 800px) explaining Study 
Tribe: click opens full-screen video modal 
• Bottom of section: horizontal strip showing 3–4 key trust numbers (e.g., 184 MDCAT 
Score | High Scorers from Test Batch | 100 Seats Only) 
3.4 Section 2: Testimonials 
• Section title: 'They Were Sitting Where You Are. Now Look.' 
• Cards in a 3-column grid (1 column on mobile) 
• Each card: student photo placeholder, name, score achieved, written testimonial quote, 
batch year 
© 2026 MDCATEMY | Confidential: For Development Use Only 
MDCATEMY: Software Requirements & Design DocumentConfidential 
• Below grid: CTA button 'Join the Tribe' same function 
3.5 Section 3: Pain Point Article 
• Section title: written like a straight-talking article a big brother would send you. Example: 
'Why Most MDCAT Students Fail. And Why You Don't Have To.' 
• Article body text in Inter, comfortable reading width (max 680px), centered 
• Speaks directly to the student. Acknowledges the overwhelm, the wasted months, the 
feeling of studying all day and still feeling behind. Does not lecture. Talks with them, not 
at them. 
• Article ends with pull-quote in large Yellow text 
• Below pull-quote: CTA button text: 'This is what I needed' or 'Get the system'. Short and 
honest. 
3.6 Section 4: Ace MDCAT Like a Warrior Course 
• Section title: 'Included Free: Ace MDCAT Like a Warrior' 
• Two-column layout: left text, right visual/mockup placeholder 
• Body text sounds like a pep talk from someone who has been through it. Not a course 
brochure. Something like: This is the course I wish existed when I was preparing. It is 
about your mindset, your daily system, and building the kind of discipline that actually 
lasts four months. 
• Bullet list of what is covered in the course (5–7 items) 
• Tag: 'Included with the Study Tribe: Not Sold Separately' 
3.7 Section 5: Study Tribe Details & Pricing 
This is the most important section. All CTA buttons across the page scroll here. 
• Section title: 'The Study Tribe: Your MDCAT System' 
• Explanation written in big brother tone: 100 students. 20 families of 5. Every family gets 
a Veteran coach who has been through MDCAT and knows the road. He checks in on 
you, reviews your week, adjusts your plan when something is not working, and is there 
when things get hard. This is not mentorship as a feature. This is someone who actually 
gives a damn. 
• Feature list with icons: everything included: Lectures, PDF Notes, Flashcards, Training 
Ground, Score Predictor, Calendar + Daily Tasks, Mistakes Copy, Ace MDCAT Like a 
Warrior Course, Weekly Test Sessions, Family Group, Mentor Access 
• Pricing card: single tier. Two payment options shown side by side inside the card. 
• Option 1: Full Payment. Rs. 24,999 paid once. Label it something like 'Pay Once, Train 
All Season'. 
• Option 2: Installments. Rs. 6,500 per month for 4 months. Label it 'Pay Monthly, Stay 
Committed'. 
• Both options use the same CTA button: 'Join the Tribe'. The selected payment option is 
passed to the checkout page. 
• Below the pricing card: 'Only X seats remaining this batch' in Yellow small caps. 
• Below that: a one-line refund reassurance. Something like: Not sure? We offer full 
refunds. No pressure. 
© 2026 MDCATEMY | Confidential: For Development Use Only 
MDCATEMY: Software Requirements & Design DocumentConfidential 
3.8 Section 6: FAQ 
• Section title: 'Questions?' 
• Accordion style: click question to expand answer 
• At minimum 8 questions covering: eligibility, what is Study Tribe, refunds, payment, 
schedule, mentors, what if I miss sessions, difference from other academies 
3.9 Section 7: Refund Policy 
• Section title: 'We Stand Behind Our System' 
• Body text sounds like a real commitment from a real person: If MDCATEMY is not right 
for you, just email us at mdcatemy@gmail.com and tell us why. We will give you a full 
refund. No forms, no conditions, no chasing us. We want you here because it works for 
you, not because you felt stuck. 
• Displayed as a simple clean callout card, Yellow left border accent 
3.10 Section 8: Scholarship 
• Section title: 'If Money is the Only Thing Stopping You, Talk to Us.' 
• Body text: eligibility criteria, application process 
• CTA: 'Apply for Scholarship': links to scholarship application form page 
• Note: No discount system. Scholarships only. 
3.11 Section 9: About Us / Meet the Team 
• Section title: 'Who Builds MDCATemy' 
• Founder card: Hayan Khan. MBBS student at Bacha Khan Medical College. Scored 184 
in MDCAT 2024. He built MDCATEMY because he went through the same chaos every 
student goes through, and he wanted to build the thing that should have existed. Not 
another academy. A system. 
• Team/coach cards: placeholder cards for Veteran coaches: name, MDCAT score, short 
bio 
• Mission statement paragraph 
3.12 Section 10: Contact 
• Section title: 'Got Questions? Talk to Us.' 
• Email: mdcatemy@gmail.com 
• WhatsApp link 
• Simple layout: no contact form needed. Just clickable links. 
3.13 Footer 
• Logo + tagline left 
• Quick links: Courses | Tests | Books | About | Join Us | Scholarship 
• Social links: YouTube, Instagram, WhatsApp 
• Copyright line: © 2026 MDCATEMY. All rights reserved. 
© 2026 MDCATEMY | Confidential: For Development Use Only 
MDCATEMY: Software Requirements & Design DocumentConfidential 
4. Authentication 
4.1 Register Page 
Accessible from navbar Login button or any CTA that requires login. Non-logged-in users hitting 
a protected route are redirected here. 
4.1.1 Fields 
Field 
Type 
Validation 
Full Name 
Email Address 
Text input 
Email input 
Required 
Required: used for login 
Password 
Confirm Password 
WhatsApp Number 
Fresher / Repeater 
Previous MDCAT Score 
Province 
City 
College / School 
FSc Year 
Target MDCAT Score 
Password input: show/hide toggle 
Password input 
Phone input with Pakistan +92 prefix 
Radio buttons 
Number input: visible only if Repeater 
selected 
Select dropdown 
Text input 
Text input 
Select: Year 1 / Year 2 / Completed 
Number input (0–210) 
Required: min 8 chars 
Required: must match 
Required 
Required 
Conditional 
Required 
Required 
Required 
Required 
Required 
• Google Sign-In button also available: pulls name and email, still shows remaining fields 
• On successful register: user is automatically logged in and redirected to dashboard 
• Batch cannot be changed after account creation: shown as info note on the form 
4.1.2 States 
• Default: empty form 
• Partial fill: fields filled, validation running inline 
• Error state: field-level red error messages below each invalid field 
• Loading: submit button shows spinner, form disabled 
• Success: brief success toast, redirect to dashboard 
4.2 Login Page 
• Email + Password fields 
• Show/hide toggle on password 
• Forgot Password link: opens forgot password flow 
• Google Sign-In button 
© 2026 MDCATEMY | Confidential: For Development Use Only 
MDCATEMY: Software Requirements & Design DocumentConfidential 
• 'Don't have an account? Register' link 
• Error state: 'Incorrect email or password' inline message 
• Loading state: spinner on button 
4.3 Forgot Password Flow 
1. User enters email: system sends reset link 
2. Email received: user clicks link, opens reset page 
3. User enters new password + confirm: submits 
4. Success: redirected to login with success toast 
4.4 Access Control Rules 
Public (no login) 
Logged in, no purchase 
Logged in, purchased 
Coach role 
Landing page, About, FAQ, Scholarship form, Courses list (view 
only), Test list (view only) 
Dashboard (limited view), Training Ground (free), Circle community 
link hidden 
Full dashboard, Training Ground, Circle SSO redirect (Phase 1), all 
purchased content 
Coach dashboard: student views, chat, task management 
Admin role 
Admin panel: full system control 
© 2026 MDCATEMY | Confidential: For Development Use Only 
MDCATEMY: Software Requirements & Design DocumentConfidential 
5. Payment Page 
5.1 Overview 
Only accessible when logged in. Triggered from any 'Join the Tribe' CTA after authentication. 
URL /checkout or /join 
Requires Login Yes: redirect to login if not authenticated 
Payment Method Automatic payment gateway (specific gateway TBD by dev team) 
5.2 Pre-Payment Form Fields 
Collected before proceeding to payment gateway: 
Field Type Validation 
Name Text input Required 
Father Name Text input Required 
Gender Select: Male / Female Required 
WhatsApp Number Phone input Required: pre-filled 
from account 
Province Select dropdown Required: pre-filled 
from account 
City Text input Required: pre-filled 
from account 
Fresher / Repeater Radio: pre-filled from account Required 
Previous MDCAT Score Number input: if Repeater Conditional 
FSc Year 1 Marks Number input (out of 550) Required 
FSc Year 2 Marks Number input (out of 550) Required 
 
5.3 Payment Flow 
5. User fills pre-payment form → clicks Proceed to Payment 
6. Redirected to payment gateway page 
7. Payment completed → gateway callback received 
8. Status: Pending → system verifies automatically 
9. On verification success: status → Paid. User redirected to dashboard with Approval 
Pending message. 
10. Admin manually reviews and activates Study Tribe access 
11. On activation: user receives notification + dashboard unlocks 
5.4 Payment Statuses 
© 2026 MDCATEMY | Confidential: For Development Use Only 
MDCATEMY: Software Requirements & Design DocumentConfidential 
Pending 
Paid 
Active 
Failed 
Refunded 
Payment submitted, awaiting automatic verification 
Verified by gateway: awaiting admin activation 
Admin has approved: full access granted 
Gateway returned failure: user shown retry option 
Refund processed by admin 
5.5 Post-Payment Dashboard State 
• Banner at top of dashboard: 'Payment received: your access is being reviewed. You will 
be notified within 24 hours.' 
• Training Ground is accessible in this state 
• All other Study Tribe features show locked state with the above message 
© 2026 MDCATEMY | Confidential: For Development Use Only 
MDCATEMY: Software Requirements & Design DocumentConfidential 
6. Student Dashboard: Phase 1 (My Camp) 
6.1 Overview 
Phase 1 dashboard is minimal. The Study Tribe community and lectures are hosted on Circle. 
The dashboard here bridges the user to Circle via SSO and provides the Training Ground. 
PHASE 1 SCOPE   
6.2 Dashboard Layout: No Purchase 
• Top: Welcome banner with student name, streak counter, motivational quote 
• Quick Stats row: MCQs practiced today | Streak | Score Predictor (based on Training 
Ground only) 
• Training Ground card: fully accessible, CTA 'Start Training' 
• My Lectures card: empty state, 'Purchase Study Tribe to unlock' with CTA 
• My Tests card: empty state, 'No tests enrolled' 
• Mistakes Copy card: shows incorrect MCQs from Training Ground sessions 
• Weekly Calendar: student can manually add their own tasks 
• Daily streaks widget: flame icon, current streak, longest streak 
• Motivational quote: rotates daily 
6.3 Dashboard Layout: Study Tribe Purchased (Phase 1) 
• All No-Purchase items above, plus: 
• 'Visit the Community' prominent card: opens Circle community in new tab via SSO single 
login 
• Approval Pending banner (if not yet activated by admin) 
• After activation: banner replaced by family display widget: shows 5 family member 
names and online status 
• Coach display: coach name, online status, message button 
© 2026 MDCATEMY | Confidential: For Development Use Only 
MDCATEMY: Software Requirements & Design DocumentConfidential 
7. Student Dashboard: Phase 2 Full LMS (My Camp) 
PHASE 2: FUTURE BUILD   
7.1 Dashboard Layout Overview 
Full-width sidebar layout. Sidebar navigation on left (240px, collapsible). Main content area 
right. 
Sidebar Navigation Items 
• My Camp (Home / Dashboard overview) 
• My Lectures 
• Training Ground 
• Revision Ground 
• My Tests 
• Mistakes Copy 
• Calendar 
• My Family 
• Score Predictor & Analytics 
• Settings 
7.2 Dashboard Home: My Camp Overview 
• Top row: Score Predictor Gauge (analogue meter, Yellow needle, score zones), overall 
prep %, streak 
• Second row: Subject prep cards: one per subject, circular progress ring, MCQs 
practiced, color coded 
• Third row: Today's tasks from calendar: checklist, click opens the exact resource 
• Fourth row: Announcements feed (dismissable cards) 
• Right sidebar panel: Family widget: 5 family members, online status, coach name + 
status, message button 
• Right sidebar panel: Time Meter: hours this week by category 
7.3 My Lectures 
Structure 
• Subjects list: Biology, Chemistry, Physics, English, Logical Reasoning 
• Click subject → opens chapters list 
• Click chapter → expands to topics list 
• Click topic → opens lecture list 
• Click lecture → opens lecture player page 
Access Rules 
• Biology: all lectures free for all users 
© 2026 MDCATEMY | Confidential: For Development Use Only 
MDCATEMY: Software Requirements & Design DocumentConfidential 
• Other subjects: first chapter free, rest locked unless purchased or Study Tribe 
• Study Tribe students: locked to their schedule: future lectures locked with date shown 
• Locked lecture: card shows padlock + unlock date or 'Purchase to unlock' 
Lecture Player Page 
• Video player: streaming only, no download, playback speed 0.5x–2x, resume from last 
position 
• DRM protection: screen recording blocking attempt 
• Below video: lecture title, topic breadcrumb, duration, completion status 
• Tab navigation below: Notes | Flashcards 
• Notes tab: PDF viewer (in-app) + download PDF button 
• Flashcards tab: must complete flashcards before lecture is marked complete 
• Flashcard interface: card shows question side, spacebar / click flips to answer side, mark 
as known / unknown, progress bar through deck, completion triggers lecture completion 
mark 
• Right panel: chapter table of contents, next/previous lecture nav 
7.4 Training Ground 
7.4.1 Landing: Two Options 
• Quiz Generator (custom quiz builder) 
• Past Papers (pre-built past paper tests by subject/chapter/topic) 
7.4.2 Quiz Generator: Builder Screen 
Student configures quiz with the following settings: 
Setting 
Input Type 
Subject/s 
Multi-select checkboxes: Biology, Chemistry, 
Physics, English, Logical Reasoning 
Chapter/s 
Multi-select: populates based on subject 
selection 
Topic/s 
Multi-select: populates based on chapter 
selection 
MCQ Source 
Radio: MDCATemy Q-Bank only | Past Papers 
only | Both 
Difficulty 
Multi-select: Easy | Medium | Hard 
Number of MCQs 
Number input: min 5, max 180 
Show Answers 
Radio: After each MCQ | At the end 
Timer 
Auto-set to 1 minute per MCQ: displayed, not 
editable by student 
Notes 
• Generate Quiz button: validates that enough MCQs exist for selection, shows count if 
insufficient 
© 2026 MDCATEMY | Confidential: For Development Use Only 
MDCATEMY: Software Requirements & Design DocumentConfidential 
7.4.3 Quiz Interface 
• Full-screen or near-full-screen focused layout, dark background 
• Top bar: Quiz title, timer countdown (MM:SS), question progress (e.g., 12 / 40), pause 
button 
• Center: one MCQ per screen: question text (with optional image if MCQ has one), 4 
option buttons below 
• Option states: default (dark row, white text) / hover (Yellow 6% opacity fill) / selected 
(Yellow left accent 3px + Yellow 10% opacity fill) / locked after selection: cannot change 
• Bottom bar: Previous | Skip | Mark | Next buttons 
• Mark button: flags MCQ for review: shows orange marker in navigator 
• MCQ Navigator: slide-out panel from right, grid of MCQ number chips, color coded: 
White (unseen) / Yellow (answered) / Orange (marked) / Gray (skipped) 
• Tab switch detection: on tab switch, show warning toast. Third switch: log and show final 
warning. 
• Timer runs per-quiz (total time = 1min x number of MCQs). If timer hits 0: quiz 
auto-submits. 
• Pause: timer pauses, screen blurs, resume button shown. Max pause time: 5 minutes. 
7.4.4 Quiz Result Page 
• Score summary: correct / incorrect / skipped / total, percentage, time taken 
• Score Predictor delta: 'Your predicted score moved from X to Y based on this session' 
• Performance by subject and topic: bar charts showing accuracy per topic 
• Filter toggle: 'Show all MCQs' / 'Show incorrect only' / 'Show marked only' 
• MCQ review list: question, all 4 options, correct answer highlighted (Green), selected 
answer highlighted (Red if wrong), full explanation text, option guess rates (% of users 
who chose each option) 
• Wrong MCQs auto-saved to Mistakes Copy 
• PDF export button: generates PDF with score summary, wrong MCQ numbers, wrong 
MCQ text 
• No reattempt allowed on same generated quiz 
7.4.5 Past Papers Section 
• Browse by: Subject → Year → Paper (or Subject → Chapter → Topic for topic-wise) 
• Each past paper test listed with: subject, year, MCQ count, duration 
• Test interface identical to Quiz Generator interface 
7.5 Revision Ground 
• Shows topics scheduled for revision today (from calendar/admin study plan) 
• Student can also manually select a topic to revise 
• Revision uses Flashcards interface: question side shown, spacebar/click flips to answer 
• End-of-session: shows which flashcards were wrong, saves wrong ones to Mistakes 
Copy 
• Spaced repetition logic: wrong flashcards scheduled for earlier re-review 
© 2026 MDCATEMY | Confidential: For Development Use Only 
MDCATEMY: Software Requirements & Design DocumentConfidential 
7.6 My Tests 
• List of all test sessions the student is enrolled in 
• Each test card: title, date/time, subject coverage, MCQ count, status (Upcoming / Live / 
Completed) 
• Upcoming tests: locked, shows countdown timer to start time 
• Live tests: CTA 'Enter Test': same interface as Quiz Generator quiz 
• Completed tests: CTA 'View Results': same as Quiz Result page 
7.7 Mistakes Copy 
• Central repository of all MCQs the student answered incorrectly across all sessions 
• Filter by: Subject | Chapter | Topic | Date added | Source (Training Ground / Test / 
Revision) 
• Each MCQ shown with question, correct answer, explanation, date added 
• 'Revise Mistakes' button: runs a focused quiz using only mistakes copy MCQs 
• 'Remove from Mistakes' button per MCQ (after student confirms mastery) 
7.8 Calendar 
• Default view: weekly calendar 
• Study Tribe students: daily tasks pre-populated from admin study plan: e.g., 'Watch 
Biology Lecture 5', 'Practice 30 MCQs: Chapter 3 Physics', 'Revise Cell Biology 
flashcards' 
• Each task is clickable: opens the exact resource (lecture / training ground pre-configured 
/ revision topic) 
• Students can also add their own personal tasks 
• Toggle between week view and month view 
• Previous weeks saved and viewable 
• Task completion auto-tracked: completed tasks show green checkmark 
7.9 Score Predictor & Analytics 
Score Predictor Gauge 
• Analogue meter design: needle points to predicted MDCAT score (0–210 scale) 
• Color zones: Red 0–100, Amber 100–150, Green 150–210 
• Calculated from: MCQ accuracy per topic weighted by MDCAT topic weightage 
Detailed Analytics 
• Per-subject prep percentage: circular ring for each subject 
• Click subject → topic-level breakdown: each topic with MCQs practiced, accuracy %, 
preparation strength (Green / Red indicator) 
• Time Meter: total hours on platform, breakdown: lectures / MCQ practice / revision / 
flashcards 
• MCQ Meter: total MCQs practiced, subject-wise, topic-wise, wrong MCQ count 
© 2026 MDCATEMY | Confidential: For Development Use Only 
MDCATEMY: Software Requirements & Design DocumentConfidential 
• All analytics auto-update from Training Ground, Mistakes Copy, and Flashcard 
performance 
7.10 Family & Mentor Display 
• Family widget in sidebar: 5 family member cards: avatar initial, name, online status dot 
(Green / Gray) 
• Family name displayed as header 
• Coach (Veteran) card: name, online status, 'Send Message' button 
• Clicking a family member card: shows their public progress stats (subject prep %, 
streak): no private data 
© 2026 MDCATEMY | Confidential: For Development Use Only 
MDCATEMY: Software Requirements & Design DocumentConfidential 
8. Coach Dashboard (Veteran) 
8.1 Overview 
Role Name 
Capacity 
Access Level 
Phase 1 
Coach (referred to as Veteran within the platform) 
5 students per Coach (Junior Mentor). 5 Junior Mentors per Senior 
Mentor (25 students). 
Separate coach role: cannot access admin panel 
Coach dashboard is Phase 2 only. In Phase 1, coach communication 
is via WhatsApp. 
PHASE 2: FUTURE BUILD   
8.2 Dashboard Home 
• 5 student cards in a grid/row: one per assigned student 
• Each card shows: avatar, name, status badge (Normal / At Risk / Excellent / Needs 
Attention), current score prediction, streak, last active time 
• Quick actions on each card: View Profile | Send Message | Add Task 
• Summary bar at top: total students / at-risk count / average score prediction across 
family 
8.3 Student Profile View 
Clicking a student card opens their full profile visible to the coach: 
• Calendar: student's daily tasks, completion rate for the week 
• Analytics: subject prep percentages, topic breakdown, time meter, MCQ meter 
• Score prediction: current gauge reading 
• Course progress: lectures watched per subject, flashcard completion 
• MCQ Practice history: sessions, accuracy trends 
• Attendance / Activity: daily hours on platform per week (bar chart) 
• Remarks history: all previous remarks added by coach 
8.4 Coach Actions per Student 
• Add Remark: text note attached to student profile with timestamp 
• Set Status: dropdown: Normal / At Risk / Excellent / Needs Attention 
• Add Task: adds a task to student's calendar for a specific date, linked to a resource or 
free text 
• Remove Task: can remove coach-added tasks (not admin-set tasks) 
• Send Message: opens 1-on-1 chat with that student 
8.5 Messaging 
• 1-on-1 chat only: no group chats 
© 2026 MDCATEMY | Confidential: For Development Use Only 
MDCATEMY: Software Requirements & Design DocumentConfidential 
• Student ↔ Coach chat 
• File sharing: PDF, images, docs: max file size TBD by dev team 
• Push notification for new messages 
• Message history persisted 
8.6 Attendance / Check-in 
• Coach can mark attendance for weekly session: Present / Absent / Excused 
• Attendance visible in student profile 
8.7 Weekly Session 
• Weekly meeting via Zoom / Google Meet: link provided by admin 
• Coach sees upcoming session scheduled in their calendar 
• Post-session: coach adds remarks and updates student status 
8.8 Coach Performance: Visible to Admin Only 
• Average score improvement of students 
• Session attendance rates 
• Remark frequency 
• Student satisfaction ratings 
© 2026 MDCATEMY | Confidential: For Development Use Only 
MDCATEMY: Software Requirements & Design DocumentConfidential 
9. Admin Dashboard 
9.1 Overview 
Access 
URL 
Phase 
Admin role only: separate login or role flag on account 
/admin 
Phase 1: payment management + student management + basic 
Q-bank. Phase 2: full control. 
9.2 Admin Navigation Sections 
• Overview (Analytics Dashboard) 
• Students 
• Coaches 
• Content Management (Lectures, Notes, Flashcards) 
• Q-Bank Management 
• Test Generator 
• Packages & Pricing 
• Payments & Refunds 
• Scholarships 
• Announcements 
• Study Plans 
• Settings 
9.3 Analytics Overview 
• Total students enrolled / active / inactive 
• Revenue this month / total 
• Average score prediction across all students 
• MCQs practiced today platform-wide 
• Refund requests pending 
• New enrollments this week 
• Coach performance summary table 
9.4 Student Management 
• Searchable, filterable table: name, email, package, payment status, activation status, 
score prediction, last active 
• Filters: package type / status / province / batch 
• Click student row → opens full student profile (same as coach view plus payment 
history) 
• Actions per student: Activate / Deactivate access | Assign Coach | Reset Password | Add 
Note | Download profile PDF 
• Account deletion: only admin can delete (soft delete: data preserved) 
• Batch field cannot be edited after registration: shown as read-only 
© 2026 MDCATEMY | Confidential: For Development Use Only 
MDCATEMY: Software Requirements & Design DocumentConfidential 
9.5 Coach Management 
• List of all coaches with type (Junior / Senior), assigned students count, performance 
rating 
• Add Coach: create coach account with role flag 
• Assign Coach to Students: select student/s → assign to a coach 
• View Coach Profile: full performance analytics 
• Deactivate Coach: reassign students before deactivation 
9.6 Content Management 
Lectures 
• Upload lecture video (server-hosted: not YouTube for Phase 2) 
• Assign to: Subject → Chapter → Topic 
• Set access: free / locked behind purchase 
• Add associated notes PDF 
• Add flashcard deck for lecture 
Flashcards 
• Create flashcard deck: Q → A pairs 
• Assign to lecture or topic 
• Definition cards and formula cards supported 
Notes 
• Upload PDF notes 
• Assign to lecture or topic 
• In-app viewer + download supported 
9.7 Q-Bank Management 
Upload MCQs 
• Upload via XLSX spreadsheet: template columns: mcq number | mcq statement | option 
a | option b | option c | option d | correct option | explanation | difficulty | subject | chapter 
| topic | extra material | year | province 
• Validation on upload: checks all required fields, flags rows with errors, shows preview 
before confirm import 
• Bulk import with duplicate detection (same MCQ text + subject + year flagged as 
duplicate) 
• Manual add single MCQ form: same fields as spreadsheet 
Browse & Edit Q-Bank 
• Full searchable, filterable table of all MCQs 
• Filters: subject / chapter / topic / difficulty / source (MDCATemy / past paper) / year 
• Inline edit: click cell to edit. Or open full edit modal. 
• Delete MCQ (soft delete: not removed from completed test history) 
© 2026 MDCATEMY | Confidential: For Development Use Only 
MDCATEMY: Software Requirements & Design DocumentConfidential 
• Export current filtered view as XLSX 
9.8 Test Generator (Admin) 
• Create test: give it a name, set date/time for scheduled release 
• Configure MCQ selection: 
◦ Select subjects, chapters, topics 
◦ Set difficulty distribution: e.g., 30% easy / 50% medium / 20% hard 
◦ Set past paper vs new MCQ ratio 
◦ Set total MCQ count (up to 180) 
◦ System auto-selects matching MCQs from Q-Bank 
• Manual override: add specific MCQs by ID or add new MCQs directly (auto-stored in 
Q-Bank) 
• Preview generated test before saving 
• Assign test to: all students / specific package / individual students 
• Test is locked until scheduled time: auto-unlocks at start time 
9.9 Packages & Pricing 
• Configure packages from admin panel: feature-based, not hardcoded 
• Package fields: name, price, included modules (checklist), active/inactive 
• Individual subject pricing: set per subject 
• Free content rules: Biology lectures free, first chapter of each subject free: configurable 
9.10 Payments & Refunds 
Payments Table 
• Columns: student name | package | amount | date | status | gateway transaction ID 
• Filter by status: Pending / Paid / Failed / Refunded 
• Action: manually activate access after payment verification 
Refund Management 
• Student requests refund via email (mdcatemy@gmail.com): admin manually creates 
refund record 
• Refund workflow: Requested → Approved → Refunded (or Rejected) 
• Each refund record: student name, reason, amount, status, action buttons (Approve / 
Reject / Mark Refunded) 
9.11 Scholarships 
• List of all scholarship applications: name, contact, academic record, status 
• Admin reviews: Approve (grants access at 0 fee) / Reject with optional message 
9.12 Announcements 
• Create announcement: title, body text, target audience (all / specific package / specific 
student/s), schedule or post immediately 
© 2026 MDCATEMY | Confidential: For Development Use Only 
MDCATEMY: Software Requirements & Design DocumentConfidential 
• Announcements appear as dismissable cards in student dashboard 
• Push notification triggered on new announcement 
9.13 Study Plans 
• Create 4-month study plan: daily tasks assigned per day 
• Each task: date, task type (watch lecture / practice MCQs / revise topic / flashcards), 
linked resource 
• Plan assigned to batch: all Study Tribe students in that batch follow the same plan 
• Admin can edit plan mid-batch: changes reflected in student calendars 
© 2026 MDCATEMY | Confidential: For Development Use Only 
MDCATEMY: Software Requirements & Design DocumentConfidential 
10. Non-Functional Requirements 
10.1 Performance 
• Page load time: under 3 seconds on standard 4G connection 
• Video streaming: adaptive bitrate, buffering handled gracefully 
• Quiz interface: zero lag on MCQ navigation, timer accurate to ±100ms 
• Database: MCQ queries must return results in under 500ms even at 10,000+ MCQ scale 
10.2 Security 
• Password hashing: bcrypt or equivalent 
• Role-based access control: student / coach / admin routes enforced server-side 
• JWT or session-based auth with refresh tokens 
• Video: DRM protection, streaming-only, no download links exposed 
• Anti-cheating: tab switch detection and logging during tests 
• Student data export: students can download their own data as structured PDF/DOC 
• Account deletion: admin-only hard delete 
10.3 Reliability 
• Daily automatic backups of database 
• Uptime target: 99.5% monthly 
• Graceful error pages (404, 500) in brand design 
10.4 Scalability 
• Phase 1: 100 students per batch 
• Phase 2: architecture must support up to 1,000 concurrent users 
• Q-Bank: must handle 50,000+ MCQs without performance degradation 
10.5 Devices & Browsers 
• Responsive web design: desktop (1280px+), tablet (768px–1279px), mobile 
(320px–767px) 
• Supported browsers: Chrome, Firefox, Safari, Edge: latest 2 versions each 
• Mobile apps: out of scope for Phase 1 and Phase 2: web only 
10.6 Accessibility 
• WCAG 2.1 AA compliance target 
• Keyboard navigation throughout 
• ARIA labels on interactive elements 
• Sufficient color contrast (minimum 4.5:1 for body text) 
© 2026 MDCATEMY | Confidential: For Development Use Only 
MDCATEMY: Software Requirements & Design DocumentConfidential 
11. MCQ Upload Spreadsheet Template 
All MCQs are uploaded to the Q-Bank via XLSX spreadsheet. The template has the following 
columns in order: 
Column Description Validation 
mcq number Unique sequential number for tracking Optional: auto-assigned if blank 
mcq statement Full text of the MCQ question Required 
option a Text of Option A Required 
option b Text of Option B Required 
option c Text of Option C Required 
option d Text of Option D Required 
correct option Value: a, b, c, or d Required 
explanation Full explanation of why the answer is 
correct 
Required: written by MDCATemy 
difficulty Value: easy, medium, or hard Required 
subject Biology / Chemistry / Physics / English / 
Logical Reasoning 
Required 
chapter Chapter name exactly as it appears in 
the platform 
Required 
topic Topic name exactly as it appears in the 
platform 
Required 
extra material Optional image URL or additional 
reference text 
Optional 
year Year of past paper (e.g., 2023): blank if 
new MCQ 
Conditional 
province Province of past paper (e.g., Punjab, 
KPK): blank if new MCQ 
Conditional 
 
ℹ  The correct option field accepts lowercase a, b, c, or d only. The system maps this to the full option 
text internally. 
ℹ  For new MDCATemy Q-Bank MCQs, leave year and province blank. For past paper MCQs, both 
year and province are required. 
ℹ  Chapter and topic values must exactly match the chapter/topic names configured in the platform. 
Mismatches will be flagged during import validation. 
 
© 2026 MDCATEMY | Confidential: For Development Use Only 
MDCATEMY: Software Requirements & Design DocumentConfidential 
12. Complete Pages & Routes Summary 
Route Page Access 
/ Landing Page Public 
/register Registration Page Public (redirect to 
dashboard if logged in) 
/login Login Page Public (redirect to 
dashboard if logged in) 
/forgot-password Forgot Password Public 
/checkout Payment Page Requires login 
/scholarship Scholarship Application Form Public 
/courses Courses / Individual Subjects Shop Public (view) / Login 
(purchase) 
/shop Supply Camp Shop Public (view) / Login 
(purchase) 
/tests Test Sessions Page Public (view) / Login (enroll) 
/about About Us Page Public 
/dashboard Student Dashboard (My Camp) Requires login 
/dashboard/lectures My Lectures Requires login + purchase 
/dashboard/lectures/:id Lecture Player Requires login + purchase + 
access 
/dashboard/training-ground Training Ground Requires login (free for all) 
/dashboard/training-ground/qui
z 
Quiz Interface (active quiz) Requires login 
/dashboard/training-ground/res
ults/:id 
Quiz Result Page Requires login 
/dashboard/revision Revision Ground Requires login + Study 
Tribe 
/dashboard/tests My Tests Requires login 
/dashboard/mistakes Mistakes Copy Requires login 
/dashboard/calendar Calendar Requires login 
/dashboard/analytics Score Predictor & Analytics Requires login 
/dashboard/family My Family Requires login + Study 
Tribe 
/dashboard/settings Account Settings Requires login 
/coach Coach Dashboard Requires coach role 
© 2026 MDCATEMY | Confidential: For Development Use Only 
MDCATEMY: Software Requirements & Design DocumentConfidential 
Requires coach role 
/coach/student/:id 
/coach/messages 
/admin 
Coach Student Profile View 
Coach Messaging 
Admin Overview 
Requires coach role 
Requires admin role 
/admin/students 
/admin/coaches 
/admin/content 
/admin/qbank 
/admin/tests 
/admin/packages 
/admin/payments 
/admin/scholarships 
/admin/announcements 
/admin/study-plans 
Student Management 
Coach Management 
Content Management 
Q-Bank Management 
Test Generator 
Packages & Pricing 
Payments & Refunds 
Scholarship Applications 
Announcements 
Study Plan Builder 
Requires admin role 
Requires admin role 
Requires admin role 
Requires admin role 
Requires admin role 
Requires admin role 
Requires admin role 
Requires admin role 
Requires admin role 
Requires admin role 
© 2026 MDCATEMY | Confidential: For Development Use Only 
MDCATEMY: Software Requirements & Design DocumentConfidential 
13. Out of Scope 
13.1 Out of Scope for Phase 1 
• Full LMS (lectures, flashcards, revision): handled by Circle in Phase 1 
• Coach dashboard: coaches communicate via WhatsApp in Phase 1 
• Blog system 
• Token / reward system 
• Mobile apps (Android / iOS) 
• AI tutor 
• In-app video calls 
• Student payment history page 
13.2 Out of Scope for Phase 2 (Future Consideration) 
• NUMS MDCAT prep content: future expansion 
• FSc Board Exam prep: future expansion 
• Matric Board Exam prep: future expansion 
• Blog module 
• Token / reward system 
• Mobile apps 
• AI tutor 
© 2026 MDCATEMY | Confidential: For Development Use Only 
MDCATEMY: Software Requirements & Design DocumentConfidential 
14. Instructions for Claude Code 
This section is addressed directly to Claude Code using the Figma MCP plugin. 
Step 1: Design System First 
12. Open Figma via MCP plugin 
13. Create a new Figma file named: MDCATemy Design System 
14. Build all color styles from Section 2.2 as Figma color styles 
15. Build all text styles from Section 2.3 as Figma text styles 
16. Build all components from Section 2.7 with all states (use Figma variants for states) 
17. Export design tokens as a JSON file for use in the frontend codebase 
Step 2: Landing Page 
18. Create a new Figma page: Landing Page 
19. Build all 10 sections from Section 3 using the design system components 
20. Build responsive variants: Desktop (1440px) + Mobile (390px) 
21. The design should match the bold editorial style of Ali Abdaal's Part-Time YouTuber 
Academy website: clean sections, strong typography, dark hero, generous whitespace, 
clear CTA hierarchy 
Step 3: Auth Pages 
22. Register page (Section 4.1) 
23. Login page (Section 4.2) 
24. Forgot password page (Section 4.3) 
Step 4: Payment Page 
25. Payment page as per Section 5 
Step 5: Student Dashboard 
26. Phase 1 version (Section 6): minimal, Training Ground + Circle redirect 
27. Phase 2 version (Section 7): full LMS dashboard with all sidebar sections 
Step 6: Coach Dashboard 
28. Full coach dashboard as per Section 8 
Step 7: Admin Dashboard 
29. All admin sections as per Section 9 
Step 8: Code Generation 
© 2026 MDCATEMY | Confidential: For Development Use Only 
MDCATEMY: Software Requirements & Design DocumentConfidential 
30. Tech stack: open: choose the best modern web stack (recommended: Next.js 14 App 
Router + Tailwind CSS + shadcn/ui base + Prisma + PostgreSQL: but defer to developer 
preference) 
31. Use the Figma design as the source of truth for all frontend components 
32. Implement all routes from Section 12 
33. Implement all access control rules from Section 4.4 
34. Implement MCQ spreadsheet import validation from Section 11 
 
ℹ  When in doubt about any specification detail, refer back to this document. Do not make 
assumptions: every interaction, state, and edge case is documented here. 
© 2026 MDCATEMY | Confidential: For Development Use Only