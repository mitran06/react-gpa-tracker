import React, { useState, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  RefreshControl,
  Modal
} from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useAuth } from '../contexts/AuthContext'
import { TemplateService } from '../services/TemplateService'
import { useErrorHandler } from '../hooks/useErrorHandler'
import ErrorModal from '../components/modals/ErrorModal'
import ConfirmationModal from '../components/modals/ConfirmationModal'
import type { Theme, Template } from '../types'

interface AdminScreenProps {
  theme: Theme
  onBack: () => void
}

const AdminScreen: React.FC<AdminScreenProps> = ({ theme, onBack }) => {  const [pendingTemplates, setPendingTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [modalVisible, setModalVisible] = useState(false)
  const [confirmationModal, setConfirmationModal] = useState<{
    visible: boolean
    title: string
    message: string
    confirmText: string
    onConfirm: () => void
    type: 'danger' | 'warning' | 'info'
  }>({
    visible: false,
    title: '',
    message: '',    confirmText: '',
    onConfirm: () => {},
    type: 'info'
  })
  
  const { isAdmin } = useAuth()
  const { error, showError, showSuccess, hideError } = useErrorHandler()

  // Debug admin status
  useEffect(() => {
    console.log('🔑 Admin Screen - isAdmin:', isAdmin)
  }, [isAdmin])

  const loadPendingTemplates = useCallback(async () => {
    try {
      const templates = await TemplateService.getPendingTemplates()
      setPendingTemplates(templates)
    } catch (error) {
      console.error('Error loading pending templates:', error)
      showError('Loading Failed', 'Failed to load pending templates. Please check your connection and try again.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [showError])

  useEffect(() => {
    if (isAdmin) {
      loadPendingTemplates()
    }
  }, [isAdmin, loadPendingTemplates])
  const onRefresh = useCallback(() => {
    setRefreshing(true)
    loadPendingTemplates()
  }, [loadPendingTemplates])
  const handleApprove = async (templateId: string) => {
    setConfirmationModal({
      visible: true,
      title: 'Approve Template',
      message: 'Are you sure you want to approve this template? It will be available to all users.',
      confirmText: 'Approve',
      type: 'info',
      onConfirm: async () => {
        setConfirmationModal(prev => ({ ...prev, visible: false }))
        try {
          console.log('🔄 Starting template approval for:', templateId)
          await TemplateService.approveTemplate(templateId)
          setPendingTemplates(prev => prev.filter(t => t.id !== templateId))
          showSuccess('Template Approved', 'The template has been approved and is now available to all users.')
          console.log('✅ Template approval completed:', templateId)
        } catch (error) {
          console.error('❌ Error approving template:', error)
          showError('Approval Failed', 'Failed to approve the template. Please try again.')
        }
      }
    })
  }
  const handleReject = async (templateId: string) => {
    setConfirmationModal({
      visible: true,
      title: 'Reject Template',
      message: 'Are you sure you want to reject this template? This action cannot be undone.',
      confirmText: 'Reject',
      type: 'danger',
      onConfirm: async () => {
        setConfirmationModal(prev => ({ ...prev, visible: false }))
        try {
          console.log('🔄 Starting template rejection for:', templateId)
          await TemplateService.deleteTemplate(templateId)
          setPendingTemplates(prev => prev.filter(t => t.id !== templateId))
          showSuccess('Template Rejected', 'The template has been rejected and removed from the system.')
          console.log('✅ Template rejection completed:', templateId)
        } catch (error) {
          console.error('❌ Error rejecting template:', error)
          showError('Rejection Failed', 'Failed to reject the template. Please try again.')
        }
      }
    })
  }

  const viewTemplate = (template: Template) => {
    setSelectedTemplate(template)
    setModalVisible(true)
  }

  if (!isAdmin) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.header, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Feather name="arrow-left" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text, fontFamily: 'Inter_700Bold' }]}>
            Admin Panel
          </Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.centerContent}>
          <Feather name="lock" size={48} color={theme.subtext} />
          <Text style={[styles.noAccessText, { color: theme.text, fontFamily: 'Inter_500Medium' }]}>
            Access Denied
          </Text>
          <Text style={[styles.noAccessSubtext, { color: theme.subtext, fontFamily: 'Inter_400Regular' }]}>
            You don't have admin privileges
          </Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text, fontFamily: 'Inter_700Bold' }]}>
          Admin Panel
        </Text>
        <TouchableOpacity onPress={onRefresh} style={styles.refreshButton}>
          <Feather name="refresh-cw" size={20} color={theme.text} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Stats */}
        <View style={[styles.statsCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: theme.primary, fontFamily: 'Inter_700Bold' }]}>
              {pendingTemplates.length}
            </Text>
            <Text style={[styles.statLabel, { color: theme.subtext, fontFamily: 'Inter_400Regular' }]}>
              Pending Reviews
            </Text>
          </View>
        </View>

        {/* Pending Templates */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text, fontFamily: 'Inter_600SemiBold' }]}>
            Pending Templates
          </Text>

          {loading ? (
            <View style={styles.centerContent}>
              <Text style={[styles.loadingText, { color: theme.subtext, fontFamily: 'Inter_400Regular' }]}>
                Loading templates...
              </Text>
            </View>
          ) : pendingTemplates.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Feather name="check-circle" size={48} color={theme.success} />
              <Text style={[styles.emptyTitle, { color: theme.text, fontFamily: 'Inter_500Medium' }]}>
                All caught up!
              </Text>
              <Text style={[styles.emptySubtext, { color: theme.subtext, fontFamily: 'Inter_400Regular' }]}>
                No templates waiting for review
              </Text>
            </View>
          ) : (
            pendingTemplates.map((template) => (
              <View key={template.id} style={[styles.templateCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <View style={styles.templateHeader}>
                  <View style={styles.templateInfo}>
                    <Text style={[styles.templateName, { color: theme.text, fontFamily: 'Inter_600SemiBold' }]}>
                      {template.name}
                    </Text>
                    <Text style={[styles.templateCreator, { color: theme.subtext, fontFamily: 'Inter_400Regular' }]}>
                      by {template.createdBy}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => viewTemplate(template)}
                    style={[styles.viewButton, { backgroundColor: theme.button }]}
                  >
                    <Feather name="eye" size={16} color={theme.text} />
                  </TouchableOpacity>
                </View>

                <Text style={[styles.templateDescription, { color: theme.subtext, fontFamily: 'Inter_400Regular' }]}>
                  {template.description}
                </Text>

                <View style={styles.templateMeta}>
                  <Text style={[styles.templateStats, { color: theme.subtext, fontFamily: 'Inter_400Regular' }]}>
                    {template.structure.semesters.length} semester{template.structure.semesters.length !== 1 ? 's' : ''} • {' '}
                    {template.structure.semesters.reduce((total, sem) => total + sem.courses.length, 0)} courses
                  </Text>
                  <Text style={[styles.templateDate, { color: theme.subtext, fontFamily: 'Inter_400Regular' }]}>
                    {new Date(template.createdAt).toLocaleDateString()}
                  </Text>
                </View>

                <View style={styles.templateActions}>
                  <TouchableOpacity
                    onPress={() => template.id && handleReject(template.id)}
                    style={[styles.actionButton, styles.rejectButton, { backgroundColor: theme.danger }]}
                  >
                    <Feather name="x" size={16} color="#ffffff" />
                    <Text style={[styles.actionButtonText, { fontFamily: 'Inter_500Medium' }]}>
                      Reject
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => template.id && handleApprove(template.id)}
                    style={[styles.actionButton, styles.approveButton, { backgroundColor: theme.success }]}
                  >
                    <Feather name="check" size={16} color="#ffffff" />
                    <Text style={[styles.actionButtonText, { fontFamily: 'Inter_500Medium' }]}>
                      Approve
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Template Detail Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text, fontFamily: 'Inter_700Bold' }]}>
                Template Details
              </Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={[styles.modalCloseButton, { backgroundColor: theme.button }]}
              >
                <Feather name="x" size={20} color={theme.text} />
              </TouchableOpacity>
            </View>

            {selectedTemplate && (
              <ScrollView style={styles.modalBody}>
                <Text style={[styles.modalTemplateName, { color: theme.text, fontFamily: 'Inter_600SemiBold' }]}>
                  {selectedTemplate.name}
                </Text>
                <Text style={[styles.modalTemplateCreator, { color: theme.subtext, fontFamily: 'Inter_400Regular' }]}>
                  Created by {selectedTemplate.createdBy}
                </Text>
                <Text style={[styles.modalTemplateDescription, { color: theme.text, fontFamily: 'Inter_400Regular' }]}>
                  {selectedTemplate.description}
                </Text>

                <Text style={[styles.modalSectionTitle, { color: theme.text, fontFamily: 'Inter_600SemiBold' }]}>
                  Structure
                </Text>

                {selectedTemplate.structure.semesters.map((semester, index) => (
                  <View key={index} style={[styles.modalSemester, { backgroundColor: theme.background, borderColor: theme.border }]}>
                    <Text style={[styles.modalSemesterName, { color: theme.text, fontFamily: 'Inter_500Medium' }]}>
                      {semester.name}
                    </Text>
                    {semester.courses.map((course, courseIndex) => (
                      <View key={courseIndex} style={styles.modalCourse}>
                        <Text style={[styles.modalCourseName, { color: theme.subtext, fontFamily: 'Inter_400Regular' }]}>
                          • {course.name} ({course.credits} credits)
                        </Text>
                      </View>
                    ))}
                  </View>
                ))}
              </ScrollView>
            )}          </View>
        </View>
      </Modal>      {/* Error Modal */}
      <ErrorModal
        visible={error?.visible || false}
        title={error?.title || ''}
        message={error?.message || ''}
        onClose={hideError}
        theme={theme}
      />

      {/* Confirmation Modal */}
      <ConfirmationModal
        visible={confirmationModal.visible}
        title={confirmationModal.title}
        message={confirmationModal.message}
        confirmText={confirmationModal.confirmText}
        onConfirm={confirmationModal.onConfirm}
        onCancel={() => setConfirmationModal(prev => ({ ...prev, visible: false }))}
        type={confirmationModal.type}
        theme={theme}
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
  refreshButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  noAccessText: {
    fontSize: 18,
    marginTop: 16,
    marginBottom: 8,
  },
  noAccessSubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  statsCard: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 32,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 32,
  },
  emptyCard: {
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
  },
  emptyTitle: {
    fontSize: 18,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  templateCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
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
    fontSize: 16,
    marginBottom: 4,
  },
  templateCreator: {
    fontSize: 12,
  },
  viewButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  templateDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  templateMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  templateStats: {
    fontSize: 12,
  },
  templateDate: {
    fontSize: 12,
  },
  templateActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  rejectButton: {
    marginRight: 8,
  },
  approveButton: {
    marginLeft: 8,
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 14,
    marginLeft: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxHeight: '80%',
    borderRadius: 16,
    padding: 0,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  modalTitle: {
    fontSize: 18,
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBody: {
    padding: 20,
  },
  modalTemplateName: {
    fontSize: 20,
    marginBottom: 4,
  },
  modalTemplateCreator: {
    fontSize: 14,
    marginBottom: 8,
  },
  modalTemplateDescription: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 20,
  },
  modalSectionTitle: {
    fontSize: 16,
    marginBottom: 12,
  },
  modalSemester: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  modalSemesterName: {
    fontSize: 14,
    marginBottom: 8,
  },
  modalCourse: {
    marginBottom: 2,
  },
  modalCourseName: {
    fontSize: 12,
  },
})

export default AdminScreen
