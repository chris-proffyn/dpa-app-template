# Taxeon - UK Self-Assessment Tax Return Application

A cross-platform application for UK Self-Assessment tax returns, built with Next.js, React Native, and Supabase.

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

- Node.js (v18 or higher)
- Yarn
- Supabase account

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/chris-proffyn/Taxeon.git
   cd Taxeon
   ```

2. Install dependencies:
   ```bash
   yarn install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory with:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

4. Start the development server:
   ```bash
   yarn dev
   ```

## Features

- Email/Password Authentication
- Protected Routes
- Responsive Dashboard
- TypeScript Support
- Tailwind CSS Styling

## Development

### Available Scripts

- `yarn dev` - Start development server
- `yarn build` - Build for production
- `yarn start` - Start production server
- `yarn lint` - Run ESLint
- `yarn test` - Run tests

## Documentation

For detailed documentation, please refer to the `/docs` directory:

- [Product Strategy](docs/Taxeon-Product-Strategy.md)
- [UX Design Guide](docs/Taxeon-UX-Design-Guide.md)
- [Multi-Platform Architecture](docs/Taxeon-Multi-Platform-Architecture.md)
- [Initial Setup Guide](docs/taxeon-initial-setup.md)

## License

This project is licensed under the MIT License - see the LICENSE file for details.
