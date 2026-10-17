# OptimalMall

Multi-vendor e-commerce marketplace for Nigeria — **Phase 1 Foundation**.

**Tagline:** Shop Smart. Live Better.

## Stack

- Laravel 13 + Inertia.js + React + Tailwind CSS
- MySQL
- Pest

## Features in Phase 1

- Responsive storefront homepage (Stitch-inspired OptimalMall branding)
- Product catalogue with search, filters, sorting and price range
- Product detail pages
- Customer registration / login (Inertia React)
- Super Admin console: dashboard, products, categories, vendors, customers, banners

Cart, Paystack, vendor portals, delivery and Flutter app arrive in later phases.

## Setup

```bash
cd /home/hp/code/optimalmall
composer install
cp .env.example .env   # if needed
php artisan key:generate

# Configure MySQL in .env (example used locally):
# DB_CONNECTION=mysql
# DB_HOST=127.0.0.1
# DB_DATABASE=optimalmall
# DB_USERNAME=root
# DB_PASSWORD=admin

mysql -h 127.0.0.1 -u root -p -e "CREATE DATABASE IF NOT EXISTS optimalmall"
php artisan migrate --seed
npm install --legacy-peer-deps
npm run build
php artisan storage:link
php artisan serve
```

Open [http://127.0.0.1:8000](http://127.0.0.1:8000).

## Seeded accounts

| Role | Email | Password |
|------|-------|----------|
| Super Admin | `admin@optimalmall.ng` | `password` |
| Customer | `customer@optimalmall.ng` | `password` |

Admin URL: `/admin`

## Tests

```bash
php artisan test --compact
```

## Design tokens

Primary `#00318e`, accent `#ff8000`, fonts Plus Jakarta Sans + Inter — from the OptimalMall Stitch design system.
