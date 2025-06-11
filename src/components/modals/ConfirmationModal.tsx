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

interface ConfirmationModalProps {
  visible: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  confirmColor?: string
  theme: Theme
  onConfirm: () => void
  onCancel: () => void
  type?: 'danger' | 'warning' | 'info'
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  visible,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmColor,
  theme,
  onConfirm,
  onCancel,
  type = 'info'
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
      case 'danger':
        return { icon: 'alert-triangle', color: theme.danger || '#FF3B30' }
      case 'warning':
        return { icon: 'alert-circle', color: '#FF9500' }
      case 'info':
      default:
        return { icon: 'help-circle', color: theme.primary }
    }
  }

  const { icon, color } = getIconAndColor()
  const buttonColor = confirmColor || color

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onCancel}
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
          onPress={onCancel}
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

              {/* Buttons */}
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton, { backgroundColor: theme.button, borderColor: theme.border }]}
                  onPress={onCancel}
                >
                  <Text style={[styles.cancelButtonText, { color: theme.text, fontFamily: 'Inter_500Medium' }]}>
                    {cancelText}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, styles.confirmButton, { backgroundColor: buttonColor }]}
                  onPress={onConfirm}
                >
                  <Text style={[styles.confirmButtonText, { fontFamily: 'Inter_600SemiBold' }]}>
                    {confirmText}
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
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  cancelButton: {
    borderWidth: 1,
  },
  confirmButton: {
    // No additional styles needed
  },
  cancelButtonText: {
    fontSize: 16,
  },
  confirmButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
})

export default ConfirmationModal
