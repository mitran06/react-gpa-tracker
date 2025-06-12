import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Animated,
  Dimensions,
  ActivityIndicator
} from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useAuth } from '../../contexts/AuthContext'
import { useErrorHandler } from '../../hooks/useErrorHandler'
import type { Theme } from '../../types'

interface EmailVerificationModalProps {
  visible: boolean
  theme: Theme
  onClose: () => void
  userEmail: string
}

const EmailVerificationModal: React.FC<EmailVerificationModalProps> = ({
  visible,
  theme,
  onClose,
  userEmail
}) => {
  const { sendVerificationEmail, checkEmailVerification, logout } = useAuth()
  const { showError, showSuccess } = useErrorHandler()
  const [loading, setLoading] = useState(false)
  const [checkingVerification, setCheckingVerification] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)

  const fadeAnim = React.useRef(new Animated.Value(0)).current
  const scaleAnim = React.useRef(new Animated.Value(0.8)).current

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 100,
          useNativeDriver: true,
        }),
      ]).start()
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start()
    }
  }, [visible, fadeAnim, scaleAnim])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (resendCooldown > 0) {
      interval = setInterval(() => {
        setResendCooldown(prev => prev - 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [resendCooldown])

  const handleResendVerification = async () => {
    if (resendCooldown > 0) return

    setLoading(true)
    try {
      await sendVerificationEmail()
      showSuccess('Email Sent', 'Verification email sent successfully!')
      setResendCooldown(60) // 60 second cooldown
    } catch (error: any) {
      showError('Send Failed', 'Failed to send verification email. Please try again.')
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
        onClose()
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
      onClose()
    } catch (error) {
      showError('Logout Failed', 'Failed to logout. Please try again.')
    }
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View 
        style={[
          styles.overlay,
          {
            opacity: fadeAnim,
          }
        ]}
      >
        <TouchableOpacity
          style={styles.overlayTouch}
          activeOpacity={1}
          onPress={() => {}} // Prevent closing by tapping outside
        >
          <Animated.View
            style={[
              styles.modal,
              {
                backgroundColor: theme.card,
                borderColor: theme.border,
                transform: [{ scale: scaleAnim }],
              }
            ]}
          >
            <TouchableOpacity activeOpacity={1}>
              {/* Icon */}
              <View
                style={[
                  styles.iconContainer,
                  {
                    backgroundColor: `${theme.primary}15`,
                  },
                ]}
              >
                <Feather name="mail" size={32} color={theme.primary} />
              </View>

              {/* Title */}
              <Text style={[styles.title, { color: theme.text, fontFamily: 'Inter_700Bold' }]}>
                Verify Your Email
              </Text>

              {/* Message */}
              <Text style={[styles.message, { color: theme.subtext, fontFamily: 'Inter_400Regular' }]}>
                We've sent a verification email to:
              </Text>
              
              <Text style={[styles.email, { color: theme.text, fontFamily: 'Inter_600SemiBold' }]}>
                {userEmail}
              </Text>

              <Text style={[styles.instruction, { color: theme.subtext, fontFamily: 'Inter_400Regular' }]}>
                Please check your inbox and click the verification link to activate your account.
              </Text>

              {/* Buttons */}
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
                    <Text style={[styles.buttonText, { fontFamily: 'Inter_600SemiBold' }]}>
                      I've Verified
                    </Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.secondaryButton,
                    { 
                      borderColor: theme.border,
                      opacity: (loading || resendCooldown > 0) ? 0.6 : 1
                    }
                  ]}
                  onPress={handleResendVerification}
                  disabled={loading || resendCooldown > 0}
                >
                  {loading ? (
                    <ActivityIndicator color={theme.primary} size="small" />
                  ) : (
                    <Text style={[styles.secondaryButtonText, { color: theme.primary, fontFamily: 'Inter_600SemiBold' }]}>
                      {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Email'}
                    </Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, styles.tertiaryButton]}
                  onPress={handleLogout}
                >
                  <Text style={[styles.tertiaryButtonText, { color: theme.subtext, fontFamily: 'Inter_500Medium' }]}>
                    Use Different Account
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Animated.View>
    </Modal>
  )
}

const { width } = Dimensions.get('window')

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayTouch: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  modal: {
    width: width * 0.9,
    maxWidth: 400,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 8,
  },
  email: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 12,
  },
  instruction: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
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
  tertiaryButton: {
    backgroundColor: 'transparent',
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
  tertiaryButtonText: {
    fontSize: 14,
    textAlign: 'center',
  },
})

export default EmailVerificationModal
