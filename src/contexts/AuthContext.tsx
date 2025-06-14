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
  type User as FirebaseUser,
  type UserCredential
} from 'firebase/auth'
import AsyncStorage from '@react-native-async-storage/async-storage'
import type { User } from '../types'

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<UserCredential>
  register: (email: string, password: string) => Promise<{ needsVerification: boolean }>
  logout: () => Promise<void>
  sendVerificationEmail: () => Promise<void>
  checkEmailVerification: () => Promise<boolean>
  forceTokenRefresh: () => Promise<void>
  cleanupUnverifiedAccount: () => Promise<void>
  isAdmin: boolean
  firebaseError: string | null
  lastLoginTime: Date | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// admin UID - replace with your actual admin user UID
const ADMIN_UID = 'your-admin-uid-here' // replace with your admin user's UID

console.log('admin UID configured as:', ADMIN_UID)

// Time limits for unverified accounts (in milliseconds)
const UNVERIFIED_ACCOUNT_TIMEOUT = 24 * 60 * 60 * 1000 // 24 hours
const MAX_UNVERIFIED_ACCOUNT_AGE = 7 * 24 * 60 * 60 * 1000 // 7 days

/**
 * Checks if an unverified account should be deleted based on age and activity
 * @param firebaseUser - The Firebase user to check
 * @returns Promise<boolean> - true if account was deleted, false otherwise
 */
const checkAndDeleteUnverifiedAccount = async (firebaseUser: FirebaseUser): Promise<boolean> => {
  try {
    // Skip deletion for admin users
    if (firebaseUser.uid === ADMIN_UID) {
      console.log('🔧 Admin user - skipping verification check')
      return false
    }

    // Skip deletion if email is already verified
    if (firebaseUser.emailVerified) {
      console.log('✅ Email verified - account is valid')
      return false
    }

    // Get account creation time
    const creationTime = new Date(firebaseUser.metadata.creationTime || Date.now())
    const now = new Date()
    const accountAge = now.getTime() - creationTime.getTime()

    console.log('⏰ Account Info:', {
      email: firebaseUser.email,
      created: creationTime.toISOString(),
      ageHours: Math.round(accountAge / (1000 * 60 * 60)),
      emailVerified: firebaseUser.emailVerified
    })

    // Delete accounts older than 7 days that are still unverified
    if (accountAge > MAX_UNVERIFIED_ACCOUNT_AGE) {
      console.log('🗑️ Deleting account older than 7 days without verification')
      await deleteUser(firebaseUser)
      return true
    }

    // For accounts older than 24 hours, check last sign-in time
    if (accountAge > UNVERIFIED_ACCOUNT_TIMEOUT) {
      const lastSignInTime = new Date(firebaseUser.metadata.lastSignInTime || firebaseUser.metadata.creationTime || Date.now())
      const timeSinceLastSignIn = now.getTime() - lastSignInTime.getTime()

      // Delete if no recent activity (no sign-in in the last 24 hours) and still unverified
      if (timeSinceLastSignIn > UNVERIFIED_ACCOUNT_TIMEOUT) {
        console.log('🗑️ Deleting inactive unverified account (no sign-in for 24+ hours)')
        await deleteUser(firebaseUser)
        return true
      }
    }

    // Account is recent or has recent activity - keep it for now
    console.log('⏳ Keeping unverified account (still within grace period)')
    return false

  } catch (error) {
    console.error('❌ Error checking/deleting unverified account:', error)
    // Don't delete on error - better to keep account than accidentally delete valid one
    return false
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [firebaseError, setFirebaseError] = useState<string | null>(null)
  const [lastLoginTime, setLastLoginTime] = useState<Date | null>(null)

  useEffect(() => {
    // Load last login time
    const loadLastLoginTime = async () => {
      try {        
        const savedLastLogin = await AsyncStorage.getItem('last_login_time')
        if (savedLastLogin) {
          setLastLoginTime(new Date(savedLastLogin))
        }
      } catch (error) {        console.error('Error loading last login time:', error)
      }
    }
    loadLastLoginTime()
  }, [])
  useEffect(() => {
    // Initialize auth state listener
    const initializeAuth = async () => {
      try {
        if (!auth) {
          throw new Error('Firebase Auth not available')
        }
        
        // Add a loading timeout to prevent infinite loading
        const loadingTimeout = setTimeout(() => {
          console.log('⚠️ Auth loading timeout - setting loading to false')
          setLoading(false)
        }, 10000) // 10 second timeout
        
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
          clearTimeout(loadingTimeout) // Clear timeout when auth state changes
          
          if (firebaseUser) {
            // Debug: Log current user info
            console.log('🔑 Current User Info:', {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              emailVerified: firebaseUser.emailVerified,
              isAdmin: firebaseUser.uid === ADMIN_UID
            })

            // Check if account should be deleted due to lack of verification
            const shouldDelete = await checkAndDeleteUnverifiedAccount(firebaseUser)
            if (shouldDelete) {
              console.log('🗑️ Unverified account deleted - redirecting to login')
              setUser(null)
              setLoading(false)
              return
            }

            // Force token refresh to ensure Firestore gets updated claims
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
      
      const result = await signInWithEmailAndPassword(auth, email, password)      
      // Update last login time
      setLastLoginTime(new Date())
      
      // Persistent login is always enabled
      console.log('🔒 Persistent login enabled - session will remain active')
      
      // Store auth info in AsyncStorage for persistence
      try {
        await AsyncStorage.setItem('auth_persistence', 'true')
        await AsyncStorage.setItem('last_login_time', new Date().toISOString())
        console.log('💾 Auth persistence data saved locally')
      } catch (storageError) {
        console.warn('⚠️ Failed to save auth persistence data:', storageError)
        // Continue anyway, this is just for extra persistence
      }
      
      return result
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
        console.log('✅ Account created and verification email sent.')
        console.log('⚠️ Note: Unverified accounts will be automatically deleted after 7 days to keep the system clean.')
        
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
      throw error    }
  }
  
  const logout = async () => {
    try {
      if (!auth) {
        throw new Error('Firebase Auth not available')
      }
      
      // Clear persistence data when user manually logs out
      try {
        await AsyncStorage.removeItem('auth_persistence')
        await AsyncStorage.removeItem('last_login_time')
        console.log('🗑️ Auth persistence data cleared on logout')
      } catch (storageError) {
        console.warn('⚠️ Failed to clear auth persistence data:', storageError)
      }
      
      // Clear local state
      setLastLoginTime(null)
      
      await signOut(auth)
    } catch (error) {
      console.error('Logout error:', error)
      throw error
    }
  }

  const cleanupUnverifiedAccount = async () => {
    try {
      if (!auth.currentUser) {
        console.log('🚫 No user logged in - nothing to cleanup')
        return
      }

      // Check if current user should be deleted
      const shouldDelete = await checkAndDeleteUnverifiedAccount(auth.currentUser)
      if (shouldDelete) {
        console.log('🗑️ Current unverified account cleaned up')
        // User will be automatically logged out due to account deletion
      } else {
        console.log('✅ Current account is valid - no cleanup needed')
      }
    } catch (error) {
      console.error('❌ Error during manual cleanup:', error)
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
    cleanupUnverifiedAccount,    isAdmin,
    firebaseError,
    lastLoginTime
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
