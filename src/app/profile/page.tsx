'use client'

import { useState, useEffect } from 'react'
import Navigation from '@/components/Navigation'
import { supabase } from '@/lib/supabaseClient'

interface ProfileSection {
  title: string
  fields: {
    label: string
    type: string
    name: string
    placeholder?: string
    pattern?: string
    required?: boolean
  }[]
}

export default function ProfilePage() {
  const [expandedSection, setExpandedSection] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    givenNames: '',
    surname: '',
    addressLine1: '',
    addressLine2: '',
    cityTown: '',
    county: '',
    postcode: '',
    email: '',
    mobilePhone: '',
    dateOfBirth: '',
    nationalInsuranceNumber: '',
    uniqueTaxpayerReference: '',
    bankName: '',
    sortCode: '',
    accountNumber: '',
    accountName: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const sections: ProfileSection[] = [
    {
      title: 'Basic Information',
      fields: [
        { label: 'Given Name(s)', type: 'text', name: 'givenNames', required: true },
        { label: 'Surname', type: 'text', name: 'surname', required: true },
        { label: 'Address Line 1', type: 'text', name: 'addressLine1', required: true },
        { label: 'Address Line 2', type: 'text', name: 'addressLine2' },
        { label: 'City/Town', type: 'text', name: 'cityTown', required: true },
        { label: 'County', type: 'text', name: 'county' },
        { label: 'Postcode', type: 'text', name: 'postcode', required: true, pattern: '^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$', placeholder: 'e.g., SW1A 1AA' },
        { label: 'Email', type: 'email', name: 'email', required: true },
        { label: 'Mobile Phone', type: 'tel', name: 'mobilePhone', pattern: '[0-9]{11}', placeholder: '11-digit UK mobile number' },
      ],
    },
    {
      title: 'Personal Information',
      fields: [
        { label: 'Date of Birth', type: 'date', name: 'dateOfBirth', required: true },
        { label: 'National Insurance Number', type: 'text', name: 'nationalInsuranceNumber', pattern: '[A-Z]{2}[0-9]{6}[A-Z]', placeholder: 'e.g., AB123456C', required: true },
        { label: 'Unique Taxpayer Reference', type: 'text', name: 'uniqueTaxpayerReference', pattern: '[0-9]{10}', placeholder: '10-digit UTR', required: true },
      ],
    },
    {
      title: 'Financial Information',
      fields: [
        { label: 'Bank Name', type: 'text', name: 'bankName', required: true },
        { label: 'Sort Code', type: 'text', name: 'sortCode', pattern: '[0-9]{6}', placeholder: '6-digit sort code', required: true },
        { label: 'Account Number', type: 'text', name: 'accountNumber', pattern: '[0-9]{8}', placeholder: '8-digit account number', required: true },
        { label: 'Account Name', type: 'text', name: 'accountName', required: true },
      ],
    },
  ]

  useEffect(() => {
    loadProfileData()
  }, [])

  const loadProfileData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Load basic user details
      const { data: userDetails, error: userDetailsError } = await supabase
        .from('user_details')
        .select('given_names, surname, address_line1, address_line2, city_town, county, postcode, email, mobile_phone')
        .eq('user_id', user.id)
        .single()

      if (userDetailsError) {
        console.error('Error loading user details:', userDetailsError)
      }

      if (userDetails) {
        setFormData(prev => ({
          ...prev,
          givenNames: userDetails.given_names || '',
          surname: userDetails.surname || '',
          addressLine1: userDetails.address_line1 || '',
          addressLine2: userDetails.address_line2 || '',
          cityTown: userDetails.city_town || '',
          county: userDetails.county || '',
          postcode: userDetails.postcode || '',
          email: userDetails.email || '',
          mobilePhone: userDetails.mobile_phone || '',
        }))
      }

      // Load encrypted personal details
      const { data: personalDetails, error: personalError } = await supabase
        .rpc('get_decrypted_personal_details', {
          p_user_id: user.id,
          p_secret: process.env.NEXT_PUBLIC_TAXEON_SECRET || ''
        })

      if (personalError) {
        console.error('Error loading personal details:', personalError)
      }

      if (personalDetails && personalDetails.length > 0) {
        const details = personalDetails[0]
        setFormData(prev => ({
          ...prev,
          dateOfBirth: details.date_of_birth || '',
          nationalInsuranceNumber: details.national_insurance_number || '',
          uniqueTaxpayerReference: details.unique_taxpayer_reference || '',
        }))
      }

      // Load encrypted financial details
      const { data: financialDetails, error: financialError } = await supabase
        .rpc('get_decrypted_financial_details', {
          p_user_id: user.id,
          p_secret: process.env.NEXT_PUBLIC_TAXEON_SECRET || ''
        })

      if (financialError) {
        console.error('Error loading financial details:', financialError)
      }

      if (financialDetails && financialDetails.length > 0) {
        const details = financialDetails[0]
        setFormData(prev => ({
          ...prev,
          bankName: details.bank_name || '',
          sortCode: details.sort_code || '',
          accountNumber: details.account_number || '',
          accountName: details.account_name || '',
        }))
      }
    } catch (error) {
      console.error('Error loading profile data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const validateField = (name: string, value: string, pattern?: string) => {
    if (!value && sections.some(section => 
      section.fields.some(field => field.name === name && field.required)
    )) {
      return 'This field is required'
    }

    if (pattern && value && !new RegExp(pattern).test(value)) {
      return 'Invalid format'
    }

    return ''
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    const field = sections
      .flatMap(section => section.fields)
      .find(f => f.name === name)
    
    if (field) {
      const error = validateField(name, value, field.pattern)
      setErrors(prev => ({ ...prev, [name]: error }))
    }
  }

  const toggleSection = (title: string) => {
    setExpandedSection(expandedSection === title ? null : title)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setSaveSuccess(false)
    setSaveError(null)
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setSaveError('User not authenticated')
        return
      }

      // Validate all fields
      const newErrors: Record<string, string> = {}
      sections.forEach(section => {
        section.fields.forEach(field => {
          const error = validateField(field.name, formData[field.name as keyof typeof formData], field.pattern)
          if (error) {
            newErrors[field.name] = error
          }
        })
      })

      setErrors(newErrors)

      if (Object.keys(newErrors).length === 0) {
        console.log('Checking if user details exist...')
        // Check if user details exist
        const { data: existingUser } = await supabase
          .from('user_details')
          .select('id')
          .eq('user_id', user.id)
          .single()

        console.log('Saving user details...')
        // Save basic user details
        const { error: userError } = await supabase
          .from('user_details')
          .upsert({
            user_id: user.id,
            given_names: formData.givenNames,
            surname: formData.surname,
            address_line1: formData.addressLine1,
            address_line2: formData.addressLine2,
            city_town: formData.cityTown,
            county: formData.county,
            postcode: formData.postcode,
            email: formData.email,
            mobile_phone: formData.mobilePhone,
          }, {
            onConflict: 'user_id',
            ignoreDuplicates: false
          })

        if (userError) {
          console.error('Error saving user details:', userError)
          setSaveError(`Error saving basic details: ${userError.message}`)
          return
        }

        console.log('Saving personal details...')
        // Save encrypted personal details using RPC
        const { error: personalError } = await supabase.rpc('store_encrypted_personal_details', {
          p_user_id: user.id,
          p_ni_number: formData.nationalInsuranceNumber,
          p_utr: formData.uniqueTaxpayerReference,
          p_dob: formData.dateOfBirth,
          p_secret: process.env.NEXT_PUBLIC_TAXEON_SECRET || ''
        })

        if (personalError) {
          console.error('Error saving personal details:', personalError)
          setSaveError(`Error saving personal details: ${personalError.message}`)
          return
        }

        console.log('Saving financial details...')
        // Save encrypted financial details using RPC
        const { error: financialError } = await supabase.rpc('store_encrypted_financial_details', {
          p_user_id: user.id,
          p_bank_name: formData.bankName,
          p_sort_code: formData.sortCode,
          p_account_number: formData.accountNumber,
          p_account_name: formData.accountName,
          p_secret: process.env.NEXT_PUBLIC_TAXEON_SECRET || ''
        })

        if (financialError) {
          console.error('Error saving financial details:', financialError)
          setSaveError(`Error saving financial details: ${financialError.message}`)
          return
        }

        console.log('All data saved successfully')
        setSaveSuccess(true)
        // Reload the data to show the updated values
        await loadProfileData()
      }
    } catch (error) {
      console.error('Error saving profile data:', error)
      setSaveError('Unexpected error occurred while saving')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-2xl font-semibold text-gray-900 mb-6">User Profile</h1>
          {saveSuccess && (
            <div className="mb-4 p-4 bg-green-50 border border-green-400 rounded-md">
              <p className="text-green-700">Profile updated successfully!</p>
            </div>
          )}
          {saveError && (
            <div className="mb-4 p-4 bg-red-50 border border-red-400 rounded-md">
              <p className="text-red-700">{saveError}</p>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            {sections.map((section) => (
              <div key={section.title} className="bg-white shadow rounded-lg">
                <button
                  type="button"
                  onClick={() => toggleSection(section.title)}
                  className="w-full px-4 py-4 flex justify-between items-center text-left"
                >
                  <h2 className="text-lg font-medium text-gray-900">{section.title}</h2>
                  <svg
                    className={`w-5 h-5 transform transition-transform ${
                      expandedSection === section.title ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {expandedSection === section.title && (
                  <div className="px-4 pb-4">
                    <div className="space-y-4">
                      {section.fields.map((field) => (
                        <div key={field.name}>
                          <label htmlFor={field.name} className="block text-sm font-medium text-gray-700">
                            {field.label}
                          </label>
                          {field.type === 'textarea' ? (
                            <textarea
                              id={field.name}
                              name={field.name}
                              value={formData[field.name as keyof typeof formData]}
                              onChange={handleInputChange}
                              rows={3}
                              className={`mt-1 block w-full rounded-md shadow-sm sm:text-base py-2 px-3 text-gray-900 ${
                                errors[field.name]
                                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                                  : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
                              }`}
                            />
                          ) : (
                            <input
                              type={field.type}
                              id={field.name}
                              name={field.name}
                              value={formData[field.name as keyof typeof formData]}
                              onChange={handleInputChange}
                              placeholder={field.placeholder}
                              className={`mt-1 block w-full rounded-md shadow-sm sm:text-base h-11 px-3 text-gray-900 ${
                                errors[field.name]
                                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                                  : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
                              }`}
                            />
                          )}
                          {errors[field.name] && (
                            <p className="mt-1 text-sm text-red-600">{errors[field.name]}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className={`px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white 
                  ${isSaving ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'} 
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
