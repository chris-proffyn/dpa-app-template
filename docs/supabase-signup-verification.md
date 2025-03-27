# Supabase Email Verification Implementation

## Complete Sign-Up Component with Verification

```typescript
import React, { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function SignUpPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    try {
      // Use signup method with explicit email verification
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/verify-email`,
          // Optional: custom email template configuration
          data: {
            source: 'signup'
          }
        }
      })

      if (error) {
        setError(error.message)
        return
      }

      // Check if user needs email verification
      if (data.user) {
        setSuccess('Please check your email to verify your account.')
      }
    } catch (catchError) {
      setError('An unexpected error occurred')
      console.error(catchError)
    }
  }

  return (
    <div>
      <h2>Sign Up for Taxeon</h2>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {success && <div style={{ color: 'green' }}>{success}</div>}
      
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
    </div>
  )
}
```

## Supabase Configuration Tips

### 1. Environment Variables
Create a `.env.local` file with:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 2. Email Template Configuration
In Supabase Dashboard:
- Navigate to Authentication > Email Templates
- Customize verification email template
- Ensure redirect links are correctly configured

## Verification Page Implementation

```typescript
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/router'

export default function VerifyEmailPage() {
  const [verificationStatus, setVerificationStatus] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const verifyEmail = async () => {
      // Extract verification token from URL
      const { token_hash, type } = router.query

      if (type === 'email_change') {
        setVerificationStatus('Email change requested')
        return
      }

      if (token_hash && type === 'signup') {
        try {
          const { error } = await supabase.auth.verifyOtp({
            type: 'signup',
            token_hash: token_hash as string
          })

          if (error) {
            setVerificationStatus('Verification failed: ' + error.message)
          } else {
            setVerificationStatus('Email verified successfully!')
            // Redirect to dashboard after a short delay
            setTimeout(() => router.push('/dashboard'), 2000)
          }
        } catch (error) {
          setVerificationStatus('An unexpected error occurred')
          console.error(error)
        }
      }
    }

    if (router.isReady) {
      verifyEmail()
    }
  }, [router.isReady, router.query])

  return (
    <div>
      <h2>Email Verification</h2>
      {verificationStatus && <p>{verificationStatus}</p>}
    </div>
  )
}
```

## Common Troubleshooting

### Potential Issues
1. Incorrect environment variables
2. Misconfigured email redirect URL
3. SMTP settings not properly configured in Supabase
4. Firewall or email delivery problems

### Debugging Checklist
- [ ] Verify Supabase URL and anon key
- [ ] Check email redirect configuration
- [ ] Ensure SMTP settings are correct
- [ ] Test with different email providers
- [ ] Check Supabase authentication logs

## Best Practices
- Implement proper error handling
- Provide clear user feedback
- Use secure password practices
- Add rate limiting to prevent abuse
- Implement additional verification steps if needed

## Additional Security Considerations
- Use strong password validation
- Implement CAPTCHA for signup
- Add IP-based signup restrictions
- Log signup attempts
```

### Recommended Supabase Authentication Settings
1. Enable email confirmations
2. Set up password strength requirements
3. Configure login attempt limits
```

## Conclusion
This implementation provides a robust, secure approach to user signup and email verification using Supabase, with comprehensive error handling and user experience considerations.
