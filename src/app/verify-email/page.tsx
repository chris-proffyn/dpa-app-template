'use client'

import { useEffect, useState, Suspense } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter, useSearchParams } from 'next/navigation'

function VerifyEmailForm() {
  const [verificationStatus, setVerificationStatus] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const verifyEmail = async () => {
      const token_hash = searchParams.get('token_hash')
      const type = searchParams.get('type')

      console.log('Verification params:', { token_hash, type })

      if (!token_hash || !type) {
        setVerificationStatus('Invalid verification link: Missing parameters')
        setIsLoading(false)
        return
      }

      if (type === 'email_change') {
        setVerificationStatus('Email change requested')
        setIsLoading(false)
        return
      }

      if (type === 'signup') {
        try {
          console.log('Attempting to verify email with token:', token_hash)
          const { error } = await supabase.auth.verifyOtp({
            type: 'signup',
            token_hash
          })

          if (error) {
            console.error('Verification error:', error)
            setVerificationStatus(`Verification failed: ${error.message}`)
          } else {
            console.log('Email verified successfully')
            setVerificationStatus('Email verified successfully!')
            // Redirect to login page after a short delay
            setTimeout(() => router.push('/auth?mode=login'), 2000)
          }
        } catch (error) {
          console.error('Unexpected error during verification:', error)
          setVerificationStatus('An unexpected error occurred during verification')
        }
      } else {
        setVerificationStatus(`Invalid verification type: ${type}`)
      }
      setIsLoading(false)
    }

    verifyEmail()
  }, [router, searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Email Verification
          </h2>
          {isLoading ? (
            <div className="mt-4 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-600">Verifying your email...</p>
            </div>
          ) : (
            <div className="mt-4 text-center">
              {verificationStatus?.includes('successfully') ? (
                <div className="rounded-md bg-green-50 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-green-800">
                        {verificationStatus}
                      </p>
                      <p className="mt-2 text-sm text-green-700">
                        Redirecting you to the login page...
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-md bg-red-50 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-red-800">
                        {verificationStatus}
                      </p>
                      <div className="mt-4">
                        <button
                          onClick={() => router.push('/auth?mode=login')}
                          className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                        >
                          Return to sign in
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    }>
      <VerifyEmailForm />
    </Suspense>
  )
} 