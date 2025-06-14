import React, { useState, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  RefreshControl
} from 'react-native'
import { Feather } from '@expo/vector-icons'
import { TemplateService } from '../services/TemplateService'
import { useErrorHandler } from '../hooks/useErrorHandler'
import ErrorModal from '../components/modals/ErrorModal'
import ConfirmationModal from '../components/modals/ConfirmationModal'
import type { Theme, Template } from '../types'

interface CommunityTemplatesScreenProps {
  theme: Theme
  onBack: () => void
  onSelectTemplate: (template: Template) => void
}

const CommunityTemplatesScreen: React.FC<CommunityTemplatesScreenProps> = ({
  theme,
  onBack,
  onSelectTemplate
}) => {
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  // error handling
  const { error, showError, hideError } = useErrorHandler()
  const [confirmationModal, setConfirmationModal] = useState({
    visible: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    type: 'info' as 'danger' | 'warning' | 'info',
    onConfirm: () => {}
  })

  const loadTemplates = useCallback(async () => {
    try {
      const approvedTemplates = await TemplateService.getApprovedTemplates()
      setTemplates(approvedTemplates)
    } catch (error) {
      console.error('Error loading community templates:', error)
      showError('Loading Failed', 'Failed to load community templates')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [showError])

  useEffect(() => {
    loadTemplates()
  }, [loadTemplates])

  const onRefresh = useCallback(() => {
    setRefreshing(true)
    loadTemplates()
  }, [loadTemplates])
  const handleSelectTemplate = (template: Template) => {
    setConfirmationModal({
      visible: true,
      title: 'Use Template',
      message: `Are you sure you want to use "${template.name}" by ${template.createdBy}? This will replace any existing data.`,
      confirmText: 'Use Template',
      cancelText: 'Cancel',
      type: 'warning',
      onConfirm: () => {
        onSelectTemplate(template)
        setConfirmationModal({ ...confirmationModal, visible: false })
      }
    })
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text, fontFamily: 'Inter_700Bold' }]}>
          Community Templates
        </Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Info Card */}
        <View style={[styles.infoCard, { backgroundColor: theme.background, borderColor: theme.border }]}>
          <Feather name="info" size={20} color={theme.primary} />
          <View style={styles.infoTextContainer}>
            <Text style={[styles.infoTitle, { color: theme.text, fontFamily: 'Inter_500Medium' }]}>
              Community Templates
            </Text>
            <Text style={[styles.infoText, { color: theme.subtext, fontFamily: 'Inter_400Regular' }]}>
              Templates created and shared by other users. Choose one to get started quickly with a pre-built semester structure.
            </Text>
          </View>
        </View>

        {/* Templates List */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={[styles.loadingText, { color: theme.subtext, fontFamily: 'Inter_400Regular' }]}>
              Loading community templates...
            </Text>
          </View>
        ) : templates.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Feather name="folder" size={48} color={theme.subtext} />
            <Text style={[styles.emptyTitle, { color: theme.text, fontFamily: 'Inter_500Medium' }]}>
              No Templates Available
            </Text>
            <Text style={[styles.emptySubtext, { color: theme.subtext, fontFamily: 'Inter_400Regular' }]}>
              No community templates have been approved yet. Check back later or create your own!
            </Text>
          </View>
        ) : (
          templates.map((template) => (
            <TouchableOpacity
              key={template.id}
              style={[styles.templateCard, { backgroundColor: theme.card, borderColor: theme.border }]}
              onPress={() => handleSelectTemplate(template)}
            >
              <View style={styles.templateHeader}>
                <View style={styles.templateInfo}>
                  <Text style={[styles.templateName, { color: theme.text, fontFamily: 'Inter_600SemiBold' }]}>
                    {template.name}
                  </Text>
                  <Text style={[styles.templateCreator, { color: theme.subtext, fontFamily: 'Inter_400Regular' }]}>
                    by {template.createdBy}
                  </Text>
                </View>
                <Feather name="download" size={20} color={theme.primary} />
              </View>

              <Text style={[styles.templateDescription, { color: theme.subtext, fontFamily: 'Inter_400Regular' }]}>
                {template.description}
              </Text>

              <View style={styles.templateMeta}>                <Text style={[styles.templateStats, { color: theme.subtext, fontFamily: 'Inter_400Regular' }]}>
                  {`${template.structure.semesters.length} semester${template.structure.semesters.length !== 1 ? 's' : ''} • ${template.structure.semesters.reduce((total, sem) => total + sem.courses.length, 0)} courses`}
                </Text>
                <Text style={[styles.templateDate, { color: theme.subtext, fontFamily: 'Inter_400Regular' }]}>
                  {new Date(template.createdAt).toLocaleDateString()}
                </Text>
              </View>            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      <ErrorModal
        visible={error.visible}
        title={error.title}
        message={error.message}
        type={error.type}
        theme={theme}
        onClose={hideError}
      />

      <ConfirmationModal
        visible={confirmationModal.visible}
        title={confirmationModal.title}
        message={confirmationModal.message}
        confirmText={confirmationModal.confirmText}
        cancelText={confirmationModal.cancelText}
        type={confirmationModal.type}
        theme={theme}
        onConfirm={confirmationModal.onConfirm}
        onCancel={() => setConfirmationModal({ ...confirmationModal, visible: false })}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    flex: 1,
    padding: 16,
  },
  infoCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  infoTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  infoTitle: {
    fontSize: 16,
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
  },
  emptyCard: {
    padding: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  templateCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  templateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  templateInfo: {
    flex: 1,
  },
  templateName: {
    fontSize: 18,
    marginBottom: 2,
  },
  templateCreator: {
    fontSize: 14,
  },
  templateDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  templateMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  templateStats: {
    fontSize: 12,
  },  templateDate: {
    fontSize: 12,
  },
})

export default CommunityTemplatesScreen
