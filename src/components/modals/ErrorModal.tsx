import React from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Animated,
  Dimensions
} from 'react-native'
import { Feather } from '@expo/vector-icons'
import type { Theme } from '../../types'

interface ErrorModalProps {
  visible: boolean
  title: string
  message: string
  theme: Theme
  onClose: () => void
  type?: 'error' | 'warning' | 'info' | 'success'
}

const ErrorModal: React.FC<ErrorModalProps> = ({
  visible,
  title,
  message,
  theme,
  onClose,
  type = 'error'
}) => {
  const fadeAnim = React.useRef(new Animated.Value(0)).current
  const scaleAnim = React.useRef(new Animated.Value(0.8)).current

  React.useEffect(() => {
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

  const getIconAndColor = () => {
    switch (type) {
      case 'error':
        return { icon: 'alert-circle', color: theme.danger || '#FF3B30' }
      case 'warning':
        return { icon: 'alert-triangle', color: '#FF9500' }
      case 'success':
        return { icon: 'check-circle', color: '#34C759' }
      case 'info':
      default:
        return { icon: 'info', color: theme.primary }
    }
  }

  const { icon, color } = getIconAndColor()

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
          onPress={onClose}
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
                        backgroundColor: `${color}15`,
                        alignSelf: 'center',
                        justifyContent: 'center',
                        alignItems: 'center',
                    },
                    ]}
                >
                <Feather name={icon as any} size={32} color={color} />
                </View>

              {/* Title */}
              <Text style={[styles.title, { color: theme.text, fontFamily: 'Inter_700Bold' }]}>
                {title}
              </Text>

              {/* Message */}
              <Text style={[styles.message, { color: theme.subtext, fontFamily: 'Inter_400Regular' }]}>
                {message}
              </Text>

              {/* Button */}
              <TouchableOpacity
                style={[styles.button, { backgroundColor: color }]}
                onPress={onClose}
              >
                <Text style={[styles.buttonText, { fontFamily: 'Inter_600SemiBold' }]}>
                  OK
                </Text>
              </TouchableOpacity>
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
    width: width * 0.85,
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
    marginBottom: 24,
  },
  button: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
    minWidth: 100,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
  },
})

export default ErrorModal
