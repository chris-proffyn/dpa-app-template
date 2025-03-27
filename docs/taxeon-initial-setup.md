# Taxeon Project Initial Setup Instructions

## Design Documentation Reference

**IMPORTANT**: Please carefully review the following design documents located in the `/docs` folder:

- Taxeon-Product-Strategy.md
- Taxeon-UX-Design-Guide.md
- Taxeon-Multi-Platform-Architecture.md

These documents provide comprehensive guidelines for:

- Product vision and scope
- User experience design
- Technical architecture
- Functional requirements

## Project Overview

We're building Taxeon, a cross-platform application for UK Self-Assessment tax returns, using the architectural guidelines provided in our design documents.

## Additional Design Compliance Notes

When implementing this initial setup:

1. Refer to the UX design guide for initial UI components
2. Follow the product strategy document for long-term vision alignment
3. Adhere to the multi-platform architecture principles
4. Ensure design consistency across all proposed features

### Design Document Alignment Checklist

- [ ] Review product strategy functional blocks
- [ ] Implement UX design color palette
- [ ] Follow architectural patterns in multi-platform document
- [ ] Ensure scalability and modularity

## Technical Stack

- Frontend Frameworks:
  - Web: React with Next.js
  - Mobile: React Native
- Backend: Supabase
- State Management: Redux
- Language: TypeScript

## Setup Instructions

### 1. Project Initialization

1. Create a new monorepo using Yarn Workspaces
2. Set up the following directory structure:

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

### 2. Supabase Configuration

1. Create a new Supabase project
2. Set up authentication providers:
   - Email/Password
   - Potential future social logins
3. Create initial user table with basic fields:

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3. Web Application Authentication Flow

Create a complete authentication flow with:
- Registration page
- Login page
- Password reset functionality
- Protected routing

#### Example Authentication Component

```typescript
import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/router'

export default function AuthPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    const { user, error } = await supabase.auth.signUp({
      email,
      password
    })

    if (error) {
      console.error('Error signing up:', error.message)
      return
    }

    // Redirect to homepage
    router.push('/dashboard')
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    const { user, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      console.error('Error signing in:', error.message)
      return
    }

    // Redirect to homepage
    router.push('/dashboard')
  }

  return (
    <div>
      <form onSubmit={handleSignUp}>
        <input 
          type="email" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <input 
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        <button type="submit">Sign Up</button>
      </form>
      <form onSubmit={handleSignIn}>
        <button type="submit">Sign In</button>
      </form>
    </div>
  )
}
```

### 4. Supabase Client Setup

Create a Supabase client configuration:

```typescript
// lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### 5. Environment Configuration

Create `.env.local` with:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 6. Dashboard/Homepage

Create a simple dashboard page:

```typescript
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/router'

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const router = useRouter()

  useEffect(() => {
    // Check user authentication
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        // Redirect to login if not authenticated
        router.push('/auth')
      } else {
        setUser(user)
      }
    }

    checkUser()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth')
  }

  return (
    <div>
      <h1>Taxeon Dashboard</h1>
      <p>Welcome to Taxeon!</p>
      <button onClick={handleLogout}>Logout</button>
    </div>
  )
}
```

### 7. Initial Dependencies

Install the following packages:
- `@supabase/supabase-js`
- `next`
- `react`
- `react-dom`
- `typescript`
- `@types/react`

## Acceptance Criteria

1. User can register with email and password
2. User can log in with credentials
3. Protected dashboard page
4. Logout functionality
5. Basic error handling
6. Routing between authentication and dashboard pages

## Next Steps

After completing this initial setup, we'll progressively add:
- More robust error handling
- Enhanced UI/UX
- Additional authentication providers
- More complex dashboard functionality
