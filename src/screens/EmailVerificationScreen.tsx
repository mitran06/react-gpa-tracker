import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  StatusBar
} from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useAuth } from '../contexts/AuthContext'
import { useErrorHandler } from '../hooks/useErrorHandler'
import ErrorModal from '../components/modals/ErrorModal'
import type { Theme } from '../types'

interface EmailVerificationScreenProps {
  theme: Theme
}

const EmailVerificationScreen: React.FC<EmailVerificationScreenProps> = ({ theme }) => {
  const { user, sendVerificationEmail, checkEmailVerification, logout } = useAuth()
  const { error, showError, showSuccess, hideError } = useErrorHandler()
  const [loading, setLoading] = useState(false)
  const [checkingVerification, setCheckingVerification] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (resendCooldown > 0) {
      interval = setInterval(() => {
        setResendCooldown(prev => {
          const newValue = prev - 1
          if (newValue === 0) {
            console.log('⏰ Resend cooldown finished')
          }
          return newValue
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [resendCooldown])

  // Auto-check verification status every 5 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      if (!checkingVerification) {
        const isVerified = await checkEmailVerification()
        if (isVerified) {
          // Verification successful - AuthContext will handle the state update
          // and the main app will automatically show
        }
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [checkEmailVerification, checkingVerification])
  const handleResendVerification = async () => {
    if (resendCooldown > 0) return

    setLoading(true)
    try {
      await sendVerificationEmail()
      showSuccess('Email Sent', 'Verification email sent successfully! Please check your inbox.')
      setResendCooldown(60) // 60 second cooldown
      console.log('📧 Resend cooldown started: 60 seconds')
    } catch (error: any) {
      showError('Send Failed', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCheckVerification = async () => {
    setCheckingVerification(true)
    try {
      const isVerified = await checkEmailVerification()
      if (isVerified) {
        showSuccess('Email Verified', 'Your email has been verified successfully!')
        // AuthContext will handle the state transition
      } else {
        showError('Not Verified', 'Email not yet verified. Please check your email and click the verification link.')
      }
    } catch (error) {
      showError('Check Failed', 'Failed to check verification status. Please try again.')
    } finally {
      setCheckingVerification(false)
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      showError('Logout Failed', 'Failed to logout. Please try again.')
    }
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={theme.background === '#000000' ? 'light-content' : 'dark-content'} />
      
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.logoContainer, { backgroundColor: theme.primary }]}>
            <Feather name="mail" size={48} color="#ffffff" />
          </View>
          
          <Text style={[styles.title, { color: theme.text, fontFamily: 'Inter_700Bold' }]}>
            Verify Your Email
          </Text>
          
          <Text style={[styles.subtitle, { color: theme.subtext, fontFamily: 'Inter_400Regular' }]}>
            Please verify your email to continue
          </Text>
        </View>

        {/* Main Content */}
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.emailSection}>
            <Text style={[styles.label, { color: theme.subtext, fontFamily: 'Inter_500Medium' }]}>
              Verification email sent to:
            </Text>
            <Text style={[styles.email, { color: theme.text, fontFamily: 'Inter_600SemiBold' }]}>
              {user?.email}            </Text>
          </View>
          
          <Text style={[styles.instruction, { color: theme.subtext, fontFamily: 'Inter_400Regular' }]}>
            Please check your inbox (and spam folder) and click the link to verify your account.
          </Text>

          {/* Cleanup Notice */}
          <View style={[styles.cleanupNotice, { backgroundColor: theme.background, borderColor: theme.border }]}>
            <Feather name="info" size={16} color={theme.primary} />
            <Text style={[styles.cleanupText, { color: theme.subtext, fontFamily: 'Inter_400Regular' }]}>
              Note: Unverified accounts are automatically deleted after 7 days to keep the system clean.
            </Text>
          </View>

          <View style={styles.statusContainer}>
            <View style={styles.statusRow}>
              <Feather 
                name="clock" 
                size={16} 
                color={theme.subtext} 
              />
              <Text style={[styles.statusText, { color: theme.subtext, fontFamily: 'Inter_400Regular' }]}>
                Checking verification status automatically...
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.button,
                styles.primaryButton,
                { 
                  backgroundColor: theme.primary,
                  opacity: checkingVerification ? 0.6 : 1
                }
              ]}
              onPress={handleCheckVerification}
              disabled={checkingVerification}
            >
              {checkingVerification ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text style={[styles.buttonText, { fontFamily: 'Inter_600SemiBold' }]}>                  Check Verification
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                styles.secondaryButton,
                { 
                  borderColor: (loading || resendCooldown > 0) ? theme.border : theme.primary,
                  backgroundColor: (loading || resendCooldown > 0) ? theme.card : 'transparent',
                  opacity: (loading || resendCooldown > 0) ? 0.6 : 1
                }
              ]}
              onPress={handleResendVerification}
              disabled={loading || resendCooldown > 0}
            >
              {loading ? (
                <ActivityIndicator color={theme.primary} size="small" />
              ) : (
                <Text style={[
                  styles.secondaryButtonText, 
                  { 
                    color: (loading || resendCooldown > 0) ? theme.subtext : theme.primary, 
                    fontFamily: 'Inter_600SemiBold' 
                  }
                ]}>
                  {resendCooldown > 0 ? `Resend Email (wait ${resendCooldown}s)` : 'Resend Email'}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Footer Actions */}
          <View style={styles.footerContainer}>
            <TouchableOpacity
              style={styles.footerButton}
              onPress={handleLogout}
            >
              <Text style={[styles.footerButtonText, { color: theme.subtext, fontFamily: 'Inter_500Medium' }]}>
                Use Different Account
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Help Text */}
        <View style={styles.helpContainer}>
          <Text style={[styles.helpText, { color: theme.subtext, fontFamily: 'Inter_400Regular' }]}>
            Resend if you don't receive the email within a few minutes.
          </Text>
        </View>
      </View>

      <ErrorModal
        visible={error.visible}
        title={error.title}
        message={error.message}
        type={error.type}
        theme={theme}
        onClose={hideError}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: {
    fontSize: 28,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  card: {
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  emailSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    textAlign: 'center',
  },
  instruction: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 20,
  },
  statusContainer: {
    marginBottom: 24,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  statusText: {
    fontSize: 12,
  },
  buttonContainer: {
    gap: 12,
    marginBottom: 20,
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  primaryButton: {
    // backgroundColor set dynamically
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    textAlign: 'center',
  },
  footerContainer: {
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  footerButton: {
    paddingVertical: 8,
  },
  footerButtonText: {
    fontSize: 14,
    textAlign: 'center',
  },  helpContainer: {
    marginTop: 24,
  },
  helpText: {
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'center',
  },
  cleanupNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 16,
    gap: 8,
  },
  cleanupText: {
    fontSize: 12,
    lineHeight: 16,
    flex: 1,
  },
})

export default EmailVerificationScreen
