# Taxeon

A cross-platform application for UK Self-Assessment tax returns.

## Project Structure

```
/taxeon
│
├── /packages
│   ├── /core               # Shared core logic
│   ├── /web                # Next.js web application
│   ├── /mobile             # React Native mobile app
│   └── /supabase           # Supabase configuration
│
├── /services
└── /docs
```

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- Yarn
- Supabase account

### Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/taxeon.git
cd taxeon
```

2. Install dependencies:
```bash
yarn install
```

3. Set up Supabase:
   - Create a new Supabase project
   - Copy your project URL and anon key
   - Create a `.env.local` file in the `packages/web` directory with:
     ```
     NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```

4. Start the development server:
```bash
yarn dev
```

The application will be available at `http://localhost:3000`

## Features

- User authentication (sign up, sign in, logout)
- Protected dashboard
- Modern UI with Tailwind CSS
- TypeScript support
- Next.js 13+ with App Router

## Development

- Web application: `packages/web`
- Mobile application: `packages/mobile` (coming soon)
- Shared core logic: `packages/core` (coming soon)

## Documentation

For detailed documentation, please refer to the `/docs` directory:

- Taxeon-Product-Strategy.md
- Taxeon-UX-Design-Guide.md
- Taxeon-Multi-Platform-Architecture.md
