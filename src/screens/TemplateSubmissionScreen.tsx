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
import { TemplateService } from '../services/TemplateService'
import { useErrorHandler, validateTemplateName, validateTemplateDescription } from '../hooks/useErrorHandler'
import ErrorModal from '../components/modals/ErrorModal'
import type { Theme, Semester, TemplateStructure } from '../types'

interface TemplateSubmissionScreenProps {
  theme: Theme
  currentSemesters: Semester[]
  onSubmitSuccess: () => void
  onBack: () => void
}

const TemplateSubmissionScreen: React.FC<TemplateSubmissionScreenProps> = ({
  theme,
  currentSemesters,
  onSubmitSuccess,
  onBack
}) => {  const [templateName, setTemplateName] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)

  const { user } = useAuth()
  const { error, showError, showSuccess, hideError } = useErrorHandler()

  const handleSubmit = async () => {
    // Validate template name
    const nameValidation = validateTemplateName(templateName)
    if (!nameValidation.isValid) {
      showError('Invalid Template Name', nameValidation.message || 'Template name is invalid')
      return
    }

    // Validate description
    const descValidation = validateTemplateDescription(description)
    if (!descValidation.isValid) {
      showError('Invalid Description', descValidation.message || 'Template description is invalid')
      return
    }

    // Check if user is authenticated
    if (!user?.email) {
      showError('Authentication Required', 'You must be logged in to submit a template')
      return
    }

    // Check if there are any semesters
    if (currentSemesters.length === 0) {
      showError('No Data to Submit', 'Please add at least one semester before submitting the template')
      return
    }

    // Check if semesters have courses
    const hasAnyCourses = currentSemesters.some(semester => semester.courses.length > 0)
    if (!hasAnyCourses) {
      showError('Incomplete Template', 'Please add some courses to at least one semester before submitting the template')
      return
    }

    // Check for empty semesters
    const emptySemesters = currentSemesters.filter(semester => semester.courses.length === 0)
    if (emptySemesters.length > 0) {
      showError(
        'Empty Semesters Found',
        `${emptySemesters.length} semester(s) have no courses. Please add courses or remove empty semesters.`
      )
      return
    }

    setLoading(true)
    try {
      const structure: TemplateStructure = {
        semesters: currentSemesters.map(semester => ({
          ...semester,
          courses: semester.courses.map(course => ({
            ...course,
            grade: '' // Clear grades for template
          }))
        }))
      }

      await TemplateService.submitTemplate(
        templateName.trim(),
        description.trim(),
        structure,
        user.email
      )

      showSuccess(
        'Template Submitted!',
        'Your template has been submitted successfully and will be reviewed by an admin before being approved.'
      )

      // Wait a moment for user to see success message, then navigate back
      setTimeout(() => {
        hideError()
        onSubmitSuccess()
      }, 2000)

    } catch (error) {
      showError('Submission Failed', error)
    } finally {
      setLoading(false)
    }
  }

  const totalCourses = currentSemesters.reduce((total, semester) => total + semester.courses.length, 0)

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={[styles.header, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <TouchableOpacity onPress={onBack} style={styles.backButton}>
              <Feather name="arrow-left" size={24} color={theme.text} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: theme.text, fontFamily: 'Inter_700Bold' }]}>
              Submit Template
            </Text>
            <View style={{ width: 24 }} />
          </View>

          <View style={styles.content}>
            {/* Template Preview */}
            <View style={[styles.previewCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View style={styles.previewHeader}>
                <Feather name="eye" size={20} color={theme.primary} />
                <Text style={[styles.previewTitle, { color: theme.text, fontFamily: 'Inter_600SemiBold' }]}>
                  Template Preview
                </Text>
              </View>
              <Text style={[styles.previewText, { color: theme.subtext, fontFamily: 'Inter_400Regular' }]}>
                {currentSemesters.length} semester{currentSemesters.length !== 1 ? 's' : ''} • {totalCourses} course{totalCourses !== 1 ? 's' : ''}
              </Text>
              {currentSemesters.map((semester, index) => (
                <View key={index} style={styles.semesterPreview}>
                  <Text style={[styles.semesterName, { color: theme.text, fontFamily: 'Inter_500Medium' }]}>
                    {semester.name} ({semester.courses.length} courses)
                  </Text>
                </View>
              ))}
            </View>

            {/* Form */}
            <View style={[styles.form, { backgroundColor: theme.card, borderColor: theme.border }]}>
              {/* Template Name */}
              <View style={styles.inputContainer}>
                <Text style={[styles.label, { color: theme.text, fontFamily: 'Inter_500Medium' }]}>
                  Template Name *
                </Text>
                <View style={[styles.inputWrapper, { backgroundColor: theme.button, borderColor: theme.border }]}>
                  <Feather name="file-text" size={20} color={theme.subtext} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: theme.text, fontFamily: 'Inter_400Regular' }]}
                    value={templateName}
                    onChangeText={setTemplateName}
                    placeholder="e.g., EAC Batch of 2028"
                    placeholderTextColor={theme.subtext}
                    maxLength={50}
                  />
                </View>
                <Text style={[styles.charCount, { color: theme.subtext, fontFamily: 'Inter_400Regular' }]}>
                  {templateName.length}/50
                </Text>
              </View>

              {/* Description */}
              <View style={styles.inputContainer}>
                <Text style={[styles.label, { color: theme.text, fontFamily: 'Inter_500Medium' }]}>
                  Description *
                </Text>
                <View style={[styles.textAreaWrapper, { backgroundColor: theme.button, borderColor: theme.border }]}>
                  <Feather name="edit-3" size={20} color={theme.subtext} style={styles.textAreaIcon} />
                  <TextInput
                    style={[styles.textArea, { color: theme.text, fontFamily: 'Inter_400Regular' }]}
                    value={description}
                    onChangeText={setDescription}
                    placeholder="Describe this template"
                    placeholderTextColor={theme.subtext}
                    multiline
                    numberOfLines={4}
                    maxLength={200}
                    textAlignVertical="top"
                  />
                </View>
                <Text style={[styles.charCount, { color: theme.subtext, fontFamily: 'Inter_400Regular' }]}>
                  {description.length}/200
                </Text>
              </View>

              {/* Submission Info */}
              <View style={[styles.infoCard, { backgroundColor: theme.background, borderColor: theme.border }]}>
                <Feather name="info" size={20} color={theme.primary} />
                <View style={styles.infoTextContainer}>
                  <Text style={[styles.infoTitle, { color: theme.text, fontFamily: 'Inter_500Medium' }]}>
                    Submission Guidelines
                  </Text>
                  <Text style={[styles.infoText, { color: theme.subtext, fontFamily: 'Inter_400Regular' }]}>
                    • Your template will be reviewed before approval{'\n'}
                    • Make sure courses and credits are accurate{'\n'}
                    • Templates should be useful for other students{'\n'}
                    • Your grades will be cleared from submitted templates
                  </Text>
                </View>
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                style={[
                  styles.submitButton, 
                  { 
                    backgroundColor: theme.primary,
                    opacity: loading ? 0.7 : 1
                  }
                ]}
                onPress={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <View style={styles.buttonContent}>
                    <Text style={[styles.submitButtonText, { fontFamily: 'Inter_500Medium' }]}>
                      Submitting...
                    </Text>
                  </View>
                ) : (
                  <View style={styles.buttonContent}>
                    <Feather name="send" size={20} color="#ffffff" style={styles.buttonIcon} />
                    <Text style={[styles.submitButtonText, { fontFamily: 'Inter_500Medium' }]}>
                      Submit Template
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>        </ScrollView>
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 60,
    borderBottomWidth: 1,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    textAlign: 'center',
  },
  content: {
    padding: 16,
  },
  previewCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  previewTitle: {
    fontSize: 16,
    marginLeft: 8,
  },
  previewText: {
    fontSize: 14,
    marginBottom: 12,
  },
  semesterPreview: {
    marginBottom: 4,
  },
  semesterName: {
    fontSize: 14,
  },
  form: {
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
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
  textAreaWrapper: {
    flexDirection: 'row',
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
    minHeight: 100,
  },
  textAreaIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  textArea: {
    flex: 1,
    fontSize: 16,
    minHeight: 80,
  },
  charCount: {
    fontSize: 12,
    textAlign: 'right',
    marginTop: 4,
  },
  infoCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 24,
  },
  infoTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  infoTitle: {
    fontSize: 14,
    marginBottom: 4,
  },
  infoText: {
    fontSize: 12,
    lineHeight: 16,
  },
  submitButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonIcon: {
    marginRight: 8,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
  },
})

export default TemplateSubmissionScreen
