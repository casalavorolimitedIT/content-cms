-- Adds the packages column (safe to re-run) and seeds the Selene spa packages.
-- Only fills spa rows that have no packages yet, so existing edits are never overwritten.
-- Images are left empty: upload them from the dashboard (Edit > Spa Packages).

alter table spa add column if not exists packages jsonb not null default '[]'::jsonb;

update spa
set packages = $json$
[
  {
    "name": "Tranquility Escape",
    "image": "",
    "items": ["Aroma therapy massage - 1hr", "Strawberry scrub - 45mins", "Gentle glow retreat (facial)"],
    "tagline": "Designed for deep relaxation and stress relief.",
    "price": "190000"
  },
  {
    "name": "Couples Harmony",
    "image": "",
    "items": ["Side-by-side Swedish massage - 1hr", "Routine facial (30mins) or pedicure"],
    "tagline": "A perfect shared spa experience for two",
    "price": "200000"
  },
  {
    "name": "Detox & Glow",
    "image": "",
    "items": ["Coffee scrub - 30mins", "Reflexology - 45mins"],
    "tagline": "Ideal for cleansing, energizing, and glowing skin.",
    "price": "85000"
  },
  {
    "name": "Beauty Indulgence",
    "image": "",
    "items": ["Pedicure & manicure", "Deep cleansing facial - 1hr"],
    "tagline": "A head-to-toe beauty refresher.",
    "price": "120000"
  },
  {
    "name": "Express Revive",
    "image": "",
    "items": ["Back massage - 30mins", "Lavender scrub", "Sauna"],
    "tagline": "Tailored for guests with limited time.",
    "price": "100000"
  },
  {
    "name": "Little Stars Pamper (Kids & Teens)",
    "image": "",
    "items": ["Mini manicure & pedicure (with stick on nail art)", "Head massage - 15mins", "Fresh juice (optional add-on)"],
    "tagline": "A safe and fun pampering package for younger guests.",
    "price": "35000"
  },
  {
    "name": "Bridal Glow Package",
    "image": "",
    "items": ["Strawberry body scrub - 30mins", "Anti-aging facial - 1hr", "Manicure, pedicure", "Full body wax", "Royal hammam with 30 mins", "Swedish massage female"],
    "tagline": "A complete bridal preparation package.",
    "price": "450000"
  },
  {
    "name": "Selene Signature Experience",
    "image": "",
    "items": ["Combination massage - 90mins (combo massage from menu)", "Luxury facial - 1hr (deep cleansing or anti-aging facial)", "Manicure & pedicure", "Royal hammam"],
    "tagline": "A unique all-in-one luxury treatment",
    "price": "350000"
  },
  {
    "name": "Birthday Queen/King Experience",
    "image": "",
    "items": ["1 hour special body scrub & Swedish massage", "Gentle glow retreat facial", "Manicure & pedicure", "Complimentary celebration cake & wine + decorations"],
    "tagline": "",
    "price": "280000"
  },
  {
    "name": "Birthday Signature Package",
    "image": "",
    "items": ["Swedish massage", "Manicure", "Strawberry scrub", "Complimentary cake + wine"],
    "tagline": "",
    "price": "150000"
  }
]
$json$::jsonb
where packages = '[]'::jsonb;
