# KONNECTA (Weekend Tracker)

KONNECTA is a modern Progressive Web App (PWA) designed for groups of friends to coordinate weekend visits to their hometown. It simplifies the "Who's coming home this weekend?" question with a clean, fast, and mobile-first interface.

## 🚀 Tech Stack

- **Framework:** [Next.js 16 (App Router)](https://nextjs.org/)
- **Frontend:** [React 19](https://react.dev/) (with React Compiler enabled), [Tailwind CSS 4](https://tailwindcss.com/)
- **Backend/Auth:** [Supabase](https://supabase.com/) (PostgreSQL, Row Level Security, SSR)
- **Notifications:** [OneSignal](https://onesignal.com/) for Web Push Notifications
- **Deployment:** [Vercel](https://vercel.com/)
- **Language:** [TypeScript](https://www.typescript.org/)

## ✨ Key Features

- **Authentication:** Secure login via Google OAuth and Magic Links using Supabase Auth.
- **Weekend Voting:** Users can mark themselves as "Going", "Not Going", or "Pending" for any upcoming weekend.
- **Activity Board:** Create and join specific plans (e.g., "Dinner on Saturday", "Padel match") associated with a weekend.
- **Contextual Weather:** Real-time weather forecasts for the selected weekend to help plan activities.
- **Hall of Fame:** Gamified leaderboards to track who visits most frequently.
- **Push Notifications:** Stay updated when friends change their status or new plans are created.
- **PWA Ready:** Installable on iOS and Android for a native-like experience, including pull-to-refresh.
- **Dark Mode:** Full support for system-based or manual theme switching.

## 📁 Project Structure

- `app/`: Next.js App Router pages and API routes.
  - `actions/`: Centralized Server Actions for data mutations (plans, activities, profile).
- `components/`: Modular UI components (Voting, Activity Board, Weather, etc.).
- `lib/`: Shared logic and client initializations.
  - `supabase/`: Server and Client-side Supabase configuration.
- `types/`: Centralized TypeScript interfaces and types.
- `public/`: Static assets and PWA/OneSignal service workers.

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+ 
- A Supabase project
- A OneSignal app (for notifications)

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# OneSignal
NEXT_PUBLIC_ONESIGNAL_APP_ID=your_onesignal_app_id
ONESIGNAL_REST_API_KEY=your_onesignal_rest_api_key

# Cron jobs
CRON_SECRET=your_cron_job_secret
```

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

### Database Schema

The project expects the following tables in Supabase:
- `profiles`: User profiles linked to `auth.users`.
- `weekend_plans`: Stores user status (`going`, `not_going`, `pending`) for specific dates.
- `activities`: Specific events created within a weekend.
- `activity_participants`: Join table for users attending specific activities.

Ensure Row Level Security (RLS) is enabled and configured to allow users to read all profiles/plans but only modify their own.

## 📱 PWA Features

To test PWA features locally, it is recommended to use a tool like `ngrok` or `localtunnel` to serve the app over HTTPS, as service workers and OneSignal require a secure context.

---

Built with ❤️ for the crew.
