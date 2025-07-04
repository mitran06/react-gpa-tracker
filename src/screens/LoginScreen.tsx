import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useAuth } from '../contexts/AuthContext'
import { useErrorHandler, isValidEmail, validatePassword } from '../hooks/useErrorHandler'
import ErrorModal from '../components/modals/ErrorModal'
import EmailVerificationModal from '../components/modals/EmailVerificationModal'
import type { Theme } from '../types'

interface LoginScreenProps {
  theme: Theme
}

const LoginScreen: React.FC<LoginScreenProps> = ({ theme }) => {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showVerificationModal, setShowVerificationModal] = useState(false)
  const [verificationEmail, setVerificationEmail] = useState('')

  const { login, register, user } = useAuth()
  const { error, showError, showSuccess, hideError } = useErrorHandler()

  const handleSubmit = async () => {
    // Basic validation
    if (!email.trim() || !password.trim()) {
      showError('Input Required', 'Please fill in all fields')
      return
    }

    // Email validation
    if (!isValidEmail(email.trim())) {
      showError('Invalid Email', 'Please enter a valid email address')
      return
    }

    // Password validation for registration
    if (!isLogin) {
      const passwordValidation = validatePassword(password)
      if (!passwordValidation.isValid) {
        showError('Invalid Password', passwordValidation.message || 'Password requirements not met')
        return
      }

      if (password !== confirmPassword) {
        showError('Password Mismatch', 'Passwords do not match')
        return
      }

      if (!confirmPassword.trim()) {
        showError('Confirmation Required', 'Please confirm your password')
        return
      }
    } else {
      // For login, just check minimum length
      if (password.length < 6) {
        showError('Invalid Password', 'Password must be at least 6 characters')
        return
      }
    }    setLoading(true)
    try {
      if (isLogin) {
        await login(email.trim(), password)
        // After successful login, check if email is verified
        // This will be handled by the auth state change in the main app
      } else {
        const result = await register(email.trim(), password)
        if (result.needsVerification) {
          // Show verification modal for new registrations
          setVerificationEmail(email.trim())
          setShowVerificationModal(true)
          showSuccess('Account Created', 'Please check your email and click the verification link to complete registration.')
        }
      }
    } catch (error: any) {
      showError(
        isLogin ? 'Sign In Failed' : 'Account Creation Failed',
        error
      )
    } finally {
      setLoading(false)
    }
  }

  const toggleMode = () => {
    setIsLogin(!isLogin)
    setEmail('')
    setPassword('')
    setConfirmPassword('')
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            {/* Header */}
            <View style={styles.header}>
              <View style={[styles.logoContainer, { backgroundColor: theme.primary }]}>
                <Feather name="book-open" size={40} color="#ffffff" />
              </View>
              <Text style={[styles.title, { color: theme.text, fontFamily: 'Inter_700Bold' }]}>
                GPA Calculator
              </Text>
              <Text style={[styles.subtitle, { color: theme.subtext, fontFamily: 'Inter_400Regular' }]}>
                {isLogin ? 'Welcome back!' : 'Create your account'}
              </Text>
            </View>

            {/* Form */}
            <View style={[styles.form, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Text style={[styles.formTitle, { color: theme.text, fontFamily: 'Inter_700Bold' }]}>
                {isLogin ? 'Sign In' : 'Create Account'}
              </Text>

              {/* Email Input */}
              <View style={styles.inputContainer}>
                <Text style={[styles.label, { color: theme.text, fontFamily: 'Inter_500Medium' }]}>
                  Email
                </Text>
                <View style={[styles.inputWrapper, { backgroundColor: theme.button, borderColor: theme.border }]}>
                  <Feather name="mail" size={20} color={theme.subtext} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: theme.text, fontFamily: 'Inter_400Regular' }]}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Enter your email"
                    placeholderTextColor={theme.subtext}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                  />
                </View>
              </View>

              {/* Password Input */}
              <View style={styles.inputContainer}>
                <Text style={[styles.label, { color: theme.text, fontFamily: 'Inter_500Medium' }]}>
                  Password
                </Text>
                <View style={[styles.inputWrapper, { backgroundColor: theme.button, borderColor: theme.border }]}>
                  <Feather name="lock" size={20} color={theme.subtext} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: theme.text, fontFamily: 'Inter_400Regular' }]}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Enter your password"
                    placeholderTextColor={theme.subtext}
                    secureTextEntry={!showPassword}
                    autoComplete={isLogin ? "current-password" : "new-password"}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeIcon}
                  >
                    <Feather 
                      name={showPassword ? "eye-off" : "eye"} 
                      size={20} 
                      color={theme.subtext} 
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Confirm Password Input (Register only) */}
              {!isLogin && (
                <View style={styles.inputContainer}>
                  <Text style={[styles.label, { color: theme.text, fontFamily: 'Inter_500Medium' }]}>
                    Confirm Password
                  </Text>
                  <View style={[styles.inputWrapper, { backgroundColor: theme.button, borderColor: theme.border }]}>
                    <Feather name="lock" size={20} color={theme.subtext} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.input, { color: theme.text, fontFamily: 'Inter_400Regular' }]}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      placeholder="Confirm your password"
                      placeholderTextColor={theme.subtext}
                      secureTextEntry={!showPassword}
                      autoComplete="new-password"
                    />
                  </View>
                </View>
              )}

              {/* Submit Button */}
              <TouchableOpacity
                style={[styles.submitButton, { backgroundColor: theme.primary }]}
                onPress={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <Text style={[styles.submitButtonText, { fontFamily: 'Inter_500Medium' }]}>
                    {isLogin ? 'Signing In...' : 'Creating Account...'}
                  </Text>
                ) : (
                  <Text style={[styles.submitButtonText, { fontFamily: 'Inter_500Medium' }]}>
                    {isLogin ? 'Sign In' : 'Create Account'}
                  </Text>
                )}
              </TouchableOpacity>              {/* Toggle Mode */}
              <TouchableOpacity onPress={toggleMode} style={styles.toggleButton}>
                <Text style={[styles.toggleText, { color: theme.subtext, fontFamily: 'Inter_400Regular' }]}>
                  {isLogin ? "Don't have an account? " : "Already have an account? "}
                  <Text style={[styles.toggleLink, { color: theme.primary, fontFamily: 'Inter_500Medium' }]}>
                    {isLogin ? 'Create one' : 'Sign in'}
                  </Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Custom Error Modal */}
      <ErrorModal
        visible={error.visible}
        title={error.title}
        message={error.message}
        type={error.type}
        theme={theme}
        onClose={hideError}
      />

      {/* Email Verification Modal */}
      <EmailVerificationModal
        visible={showVerificationModal}
        theme={theme}
        userEmail={verificationEmail}
        onClose={() => setShowVerificationModal(false)}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 16,
  },
  content: {
    maxWidth: 400,
    alignSelf: 'center',
    width: '100%',
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
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  form: {
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  formTitle: {
    fontSize: 24,
    marginBottom: 24,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 48,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    height: '100%',
  },
  eyeIcon: {
    padding: 4,
  },
  submitButton: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
  },
  toggleButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  toggleText: {
    fontSize: 14,
    textAlign: 'center',
  },
  toggleLink: {
    fontSize: 14,
  },
})

export default LoginScreen
