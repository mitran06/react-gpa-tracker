import { useState } from 'react'

export interface ErrorState {
  visible: boolean
  title: string
  message: string
  type: 'error' | 'warning' | 'info' | 'success'
}

export const useErrorHandler = () => {
  const [error, setError] = useState<ErrorState>({
    visible: false,
    title: '',
    message: '',
    type: 'error'
  })

  const parseFirebaseError = (error: any): string => {
    if (typeof error === 'string') return error

    const errorCode = error?.code
    const errorMessage = error?.message

    // Firebase Auth specific errors
    switch (errorCode) {
      case 'auth/email-already-in-use':
        return 'An account with this email already exists. Please sign in instead.'
      case 'auth/invalid-email':
        return 'Please enter a valid email address.'
      case 'auth/operation-not-allowed':
        return 'Email/password accounts are not enabled. Please contact support.'
      case 'auth/weak-password':
        return 'Password should be at least 6 characters long.'
      case 'auth/user-disabled':
        return 'This account has been disabled. Please contact support.'
      case 'auth/user-not-found':
        return 'No account found with this email address. Please create an account first.'      case 'auth/wrong-password':
        return 'Incorrect password. Please try again.'
      case 'auth/invalid-credential':
        return 'Invalid email or password. Please check your credentials and try again.'
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please wait a few minutes before trying again.'
      case 'auth/network-request-failed':
        return 'Network error. Please check your internet connection and try again.'
      case 'auth/requires-recent-login':
        return 'For security reasons, please log out and log back in to perform this action.'
      case 'auth/email-not-verified':
        return 'Please verify your email address before performing this action.'
      
      // Firestore specific errors
      case 'permission-denied':
        return 'You don\'t have permission to perform this action.'
      case 'not-found':
        return 'The requested data was not found.'
      case 'already-exists':
        return 'This item already exists.'
      case 'resource-exhausted':
        return 'Service is temporarily overloaded. Please try again later.'
      case 'failed-precondition':
        return 'Operation could not be completed due to current system state.'
      case 'aborted':
        return 'Operation was aborted due to a conflict. Please try again.'
      case 'out-of-range':
        return 'Invalid input provided.'
      case 'unimplemented':
        return 'This feature is not yet implemented.'
      case 'internal':
        return 'An internal error occurred. Please try again.'
      case 'unavailable':
        return 'Service is currently unavailable. Please try again later.'
      case 'data-loss':
        return 'Data corruption detected. Please contact support.'

      // Network and connection errors
      case 'fetch/network-request-failed':
      case 'network-request-failed':
        return 'Network connection failed. Please check your internet and try again.'
      
      // Generic fallbacks
      default:
        // Extract meaningful message from Firebase error
        if (errorMessage) {
          // Remove Firebase-specific prefixes
          const cleanMessage = errorMessage
            .replace(/^Firebase: /, '')
            .replace(/^Error: /, '')
            .replace(/\(auth\/[^)]+\)\.?$/, '')
            .trim()
          
          if (cleanMessage && cleanMessage !== errorMessage) {
            return cleanMessage
          }
        }
        
        return errorMessage || 'An unexpected error occurred. Please try again.'
    }
  }

  const showError = (title: string, error: any, type: 'error' | 'warning' | 'info' | 'success' = 'error') => {
    const message = parseFirebaseError(error)
    console.error(`${title}:`, error)
    
    setError({
      visible: true,
      title,
      message,
      type
    })
  }

  const showSuccess = (title: string, message: string) => {
    setError({
      visible: true,
      title,
      message,
      type: 'success'
    })
  }

  const showInfo = (title: string, message: string) => {
    setError({
      visible: true,
      title,
      message,
      type: 'info'
    })
  }

  const showWarning = (title: string, message: string) => {
    setError({
      visible: true,
      title,
      message,
      type: 'warning'
    })
  }

  const hideError = () => {
    setError(prev => ({ ...prev, visible: false }))
  }

  return {
    error,
    showError,
    showSuccess,
    showInfo,
    showWarning,
    hideError,
    parseFirebaseError
  }
}

// Utility function to validate email format
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Utility function to validate password strength
export const validatePassword = (password: string): { isValid: boolean; message?: string } => {
  if (password.length < 6) {
    return { isValid: false, message: 'Password must be at least 6 characters long' }
  }
  if (password.length > 128) {
    return { isValid: false, message: 'Password must be less than 128 characters' }
  }
  return { isValid: true }
}

// Utility function to validate template name
export const validateTemplateName = (name: string): { isValid: boolean; message?: string } => {
  if (!name.trim()) {
    return { isValid: false, message: 'Template name is required' }
  }
  if (name.trim().length < 3) {
    return { isValid: false, message: 'Template name must be at least 3 characters long' }
  }
  if (name.trim().length > 50) {
    return { isValid: false, message: 'Template name must be less than 50 characters' }
  }
  return { isValid: true }
}

// Utility function to validate template description
export const validateTemplateDescription = (description: string): { isValid: boolean; message?: string } => {
  if (!description.trim()) {
    return { isValid: false, message: 'Template description is required' }
  }
  if (description.trim().length < 10) {
    return { isValid: false, message: 'Template description must be at least 10 characters long' }
  }
  if (description.trim().length > 500) {
    return { isValid: false, message: 'Template description must be less than 500 characters' }
  }
  return { isValid: true }
}
