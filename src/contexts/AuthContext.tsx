import React, { createContext, useContext, useEffect, useState } from 'react'
import { auth } from '../../firebaseConfig'
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendEmailVerification,
  reload,
  deleteUser,
  type User as FirebaseUser
} from 'firebase/auth'
import type { User } from '../types'

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string) => Promise<{ needsVerification: boolean }>
  logout: () => Promise<void>
  sendVerificationEmail: () => Promise<void>
  checkEmailVerification: () => Promise<boolean>
  forceTokenRefresh: () => Promise<void>
  isAdmin: boolean
  firebaseError: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Admin UID - hardcoded for security
const ADMIN_UID = 'B0VcWqSh0wcjcj6BJv9a8PvCXRd2' // mitran.gokul06@gmail.com

console.log('🔧 Admin UID configured as:', ADMIN_UID)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [firebaseError, setFirebaseError] = useState<string | null>(null)

  useEffect(() => {
    // Initialize auth state listener
    const initializeAuth = async () => {
      try {
        if (!auth) {
          throw new Error('Firebase Auth not available')
        }

        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
          if (firebaseUser) {
            // Debug: Log current user info
            console.log('🔑 Current User Info:', {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              emailVerified: firebaseUser.emailVerified,
              isAdmin: firebaseUser.uid === ADMIN_UID
            })            // Force token refresh to ensure Firestore gets updated claims
            await firebaseUser.getIdToken(true)
            
            // All users (including admin) must verify their email
            // No special treatment - consistent verification for everyone
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              emailVerified: firebaseUser.emailVerified
            })
          } else {
            setUser(null)
          }
          setLoading(false)
        })

        return unsubscribe
      } catch (error) {
        console.error('Firebase auth initialization error:', error)
        setFirebaseError(error instanceof Error ? error.message : 'Firebase auth failed')
        setLoading(false)
        return () => {}
      }
    }

    initializeAuth()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      if (!auth) {
        throw new Error('Firebase Auth not available')
      }
      
      await signInWithEmailAndPassword(auth, email, password)
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  const register = async (email: string, password: string) => {
    try {
      if (!auth) {
        throw new Error('Firebase Auth not available')
      }
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      
      // Send verification email immediately after registration
      if (userCredential.user) {
        await sendEmailVerification(userCredential.user)
        
        // Keep the account (don't delete) so user can login and see verification screen
        console.log('✅ Account created and verification email sent. User can login to see verification screen.')
        
        return { needsVerification: true }
      }
      
      return { needsVerification: false }
    } catch (error) {
      console.error('Register error:', error)
      throw error
    }
  }

  const sendVerificationEmail = async () => {
    try {
      if (!auth.currentUser) {
        throw new Error('No user logged in')
      }
      
      await sendEmailVerification(auth.currentUser)
    } catch (error) {
      console.error('Send verification email error:', error)
      throw error
    }
  }
  
  const checkEmailVerification = async (): Promise<boolean> => {
    try {
      if (!auth.currentUser) {
        return false
      }
      
      // Reload user to get fresh emailVerified status
      await reload(auth.currentUser)
      
      // Force refresh the auth token to update Firestore claims
      if (auth.currentUser.emailVerified) {
        await auth.currentUser.getIdToken(true) // Force refresh
      }
      
      // Update local user state immediately if verified
      if (auth.currentUser.emailVerified) {
        setUser(prev => prev ? { ...prev, emailVerified: true } : null)
        return true
      }
      
      return false
    } catch (error) {
      console.error('Check email verification error:', error)
      return false
    }
  }

  const forceTokenRefresh = async (): Promise<void> => {
    try {
      if (!auth.currentUser) {
        throw new Error('No user logged in')
      }
      
      // Force refresh the auth token
      await auth.currentUser.getIdToken(true)
      console.log('🔄 Token refreshed successfully')
    } catch (error) {
      console.error('Force token refresh error:', error)
      throw error
    }
  }

  const logout = async () => {
    try {
      if (!auth) {
        throw new Error('Firebase Auth not available')
      }
      
      await signOut(auth)
    } catch (error) {
      console.error('Logout error:', error)
      throw error
    }
  }
  
  const isAdmin = user?.uid === ADMIN_UID
  
  const value = {
    user,
    loading,
    login,
    register,
    logout,
    sendVerificationEmail,
    checkEmailVerification,
    forceTokenRefresh,
    isAdmin,
    firebaseError
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
