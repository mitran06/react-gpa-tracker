import React from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated
} from 'react-native'
import { Feather } from '@expo/vector-icons'
import type { Theme } from '../types'

interface EmailVerificationBannerProps {
  visible: boolean
  theme: Theme
  userEmail: string
  onPress: () => void
  onDismiss: () => void
}

const EmailVerificationBanner: React.FC<EmailVerificationBannerProps> = ({
  visible,
  theme,
  userEmail,
  onPress,
  onDismiss
}) => {
  const slideAnim = React.useRef(new Animated.Value(-100)).current

  React.useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 100,
        useNativeDriver: true,
      }).start()
    } else {
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 200,
        useNativeDriver: true,
      }).start()
    }
  }, [visible, slideAnim])

  if (!visible) return null

  return (
    <Animated.View
      style={[
        styles.banner,
        {
          backgroundColor: `${theme.primary}15`,
          borderColor: theme.primary,
          transform: [{ translateY: slideAnim }],
        }
      ]}
    >
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Feather name="mail" size={16} color={theme.primary} />
        </View>
        
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: theme.text, fontFamily: 'Inter_600SemiBold' }]}>
            Verify Your Email
          </Text>
          <Text style={[styles.message, { color: theme.subtext, fontFamily: 'Inter_400Regular' }]}>
            Check {userEmail} for a verification link
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.primary }]}
          onPress={onPress}
        >
          <Text style={[styles.actionText, { fontFamily: 'Inter_500Medium' }]}>
            Verify
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.dismissButton}
          onPress={onDismiss}
        >
          <Feather name="x" size={18} color={theme.subtext} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    borderBottomWidth: 1,
    paddingTop: 60, // Account for status bar
    paddingBottom: 12,
    paddingHorizontal: 16,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    marginBottom: 2,
  },
  message: {
    fontSize: 12,
    lineHeight: 16,
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  dismissButton: {
    padding: 4,
  },
})

export default EmailVerificationBanner
