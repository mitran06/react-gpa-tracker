import React, { createContext, useContext, useEffect, useState } from 'react'
import { auth } from '../../firebaseConfig'
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User as FirebaseUser
} from 'firebase/auth'
import type { User } from '../types'

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  isAdmin: boolean
  firebaseError: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Admin UID - hardcoded for security
const ADMIN_UID = 'wJN9veAIWGhLR86PFwSXiEkUnr22' // Your actual admin UID

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
        
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
          if (firebaseUser) {
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName
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
      
      await createUserWithEmailAndPassword(auth, email, password)
    } catch (error) {
      console.error('Register error:', error)
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
