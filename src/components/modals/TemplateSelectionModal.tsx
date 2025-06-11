import { View, Text, TouchableOpacity, Modal, StyleSheet, ScrollView, Alert } from "react-native"
import { Feather } from "@expo/vector-icons"
import { useState, useEffect } from "react"
import { TemplateService } from "../../services/TemplateService"
import type { Theme, Template } from "../../types"
import { useColorScheme } from "react-native"

interface TemplateSelectionModalProps {
  visible: boolean
  theme: Theme
  handleTemplateSelection: (useDefaultTemplate: boolean, firebaseTemplate?: Template) => void
}

const TemplateSelectionModal = ({ visible, theme, handleTemplateSelection }: TemplateSelectionModalProps) => {
  const colorScheme = useColorScheme()
  const darkMode = colorScheme === "dark"
  const [approvedTemplates, setApprovedTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (visible) {
      loadApprovedTemplates()
    }
  }, [visible])

  const loadApprovedTemplates = async () => {
    setLoading(true)
    try {
      const templates = await TemplateService.getApprovedTemplates()
      setApprovedTemplates(templates)
    } catch (error) {
      console.error('Error loading approved templates:', error)
      Alert.alert('Error', 'Failed to load community templates')
    } finally {
      setLoading(false)
    }
  }

  const selectFirebaseTemplate = (template: Template) => {
    handleTemplateSelection(false, template)
  }

  return (
    <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={() => {}}>
      <View style={[styles.modalOverlay, { backgroundColor: darkMode ? "rgba(0, 0, 0, 0.9)" : "rgba(0, 0, 0, 0.7)" }]}>        <View style={[styles.welcomeModalContent, { backgroundColor: theme.card }]}>
          <Text style={[styles.welcomeTitle, { color: theme.text, fontFamily: "Inter_700Bold" }]}>
            Welcome to GPA Calculator
          </Text>
          <Text style={[styles.welcomeText, { color: theme.subtext, fontFamily: "Inter_400Regular" }]}>
            Choose how you'd like to start:
          </Text>

          <ScrollView style={styles.templateScrollView} showsVerticalScrollIndicator={false}>
            <View style={styles.templateOptions}>
              {/* Default Template */}
              <TouchableOpacity
                style={[styles.templateOption, { backgroundColor: theme.background, borderColor: theme.border }]}
                onPress={() => handleTemplateSelection(true)}
              >
                <View style={styles.templateIconContainer}>
                  <Feather name="book-open" size={40} color={theme.primary} />
                </View>
                <Text style={[styles.templateOptionTitle, { color: theme.text, fontFamily: "Inter_500Medium" }]}>
                  Default Template
                </Text>
                <Text style={[styles.templateOptionDesc, { color: theme.subtext, fontFamily: "Inter_400Regular" }]}>
                  Start with pre-filled semesters and courses
                </Text>
              </TouchableOpacity>

              {/* Blank Template */}
              <TouchableOpacity
                style={[styles.templateOption, { backgroundColor: theme.background, borderColor: theme.border }]}
                onPress={() => handleTemplateSelection(false)}
              >
                <View style={styles.templateIconContainer}>
                  <Feather name="plus-circle" size={40} color={theme.primary} />
                </View>
                <Text style={[styles.templateOptionTitle, { color: theme.text, fontFamily: "Inter_500Medium" }]}>
                  Blank Template
                </Text>
                <Text style={[styles.templateOptionDesc, { color: theme.subtext, fontFamily: "Inter_400Regular" }]}>
                  Start with an empty semester
                </Text>
              </TouchableOpacity>
            </View>

            {/* Community Templates Section */}
            {approvedTemplates.length > 0 && (
              <View style={styles.communitySection}>
                <Text style={[styles.communitySectionTitle, { color: theme.text, fontFamily: "Inter_600SemiBold" }]}>
                  Community Templates
                </Text>
                <Text style={[styles.communitySectionDesc, { color: theme.subtext, fontFamily: "Inter_400Regular" }]}>
                  Templates shared by other users
                </Text>

                {approvedTemplates.map((template) => (
                  <TouchableOpacity
                    key={template.id}
                    style={[styles.communityTemplate, { backgroundColor: theme.background, borderColor: theme.border }]}
                    onPress={() => selectFirebaseTemplate(template)}
                  >
                    <View style={styles.communityTemplateHeader}>
                      <View style={styles.communityTemplateInfo}>
                        <Text style={[styles.communityTemplateName, { color: theme.text, fontFamily: "Inter_500Medium" }]}>
                          {template.name}
                        </Text>
                        <Text style={[styles.communityTemplateCreator, { color: theme.subtext, fontFamily: "Inter_400Regular" }]}>
                          by {template.createdBy}
                        </Text>
                      </View>
                      <Feather name="download" size={16} color={theme.primary} />
                    </View>
                    <Text style={[styles.communityTemplateDesc, { color: theme.subtext, fontFamily: "Inter_400Regular" }]}>
                      {template.description}
                    </Text>
                    <Text style={[styles.communityTemplateStats, { color: theme.subtext, fontFamily: "Inter_400Regular" }]}>
                      {template.structure.semesters.length} semester{template.structure.semesters.length !== 1 ? 's' : ''} • {' '}
                      {template.structure.semesters.reduce((total, sem) => total + sem.courses.length, 0)} courses
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {loading && (
              <View style={styles.loadingContainer}>
                <Text style={[styles.loadingText, { color: theme.subtext, fontFamily: "Inter_400Regular" }]}>
                  Loading community templates...
                </Text>
              </View>
            )}
          </ScrollView>

          <Text style={[styles.welcomeNote, { color: theme.subtext, fontFamily: "Inter_400Regular" }]}>
            You can always add or remove courses later
          </Text>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  welcomeModalContent: {
    width: "90%",
    maxHeight: "80%",
    padding: 24,
    borderRadius: 16,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
  },
  welcomeText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
  },
  templateScrollView: {
    maxHeight: 400,
    marginBottom: 20,
  },
  templateOptions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  templateOption: {
    width: "48%",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
  },
  templateIconContainer: {
    marginBottom: 12,
  },
  templateOptionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  templateOptionDesc: {
    fontSize: 12,
    textAlign: "center",
    fontStyle: "italic",
  },
  communitySection: {
    marginTop: 16,
  },
  communitySectionTitle: {
    fontSize: 18,
    marginBottom: 4,
  },
  communitySectionDesc: {
    fontSize: 14,
    marginBottom: 16,
  },
  communityTemplate: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  communityTemplateHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  communityTemplateInfo: {
    flex: 1,
  },
  communityTemplateName: {
    fontSize: 16,
    marginBottom: 4,
  },
  communityTemplateCreator: {
    fontSize: 12,
  },
  communityTemplateDesc: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  communityTemplateStats: {
    fontSize: 12,
  },
  loadingContainer: {
    padding: 20,
    alignItems: "center",
  },
  loadingText: {
    fontSize: 14,
    textAlign: "center",
  },
  welcomeNote: {
    fontSize: 12,
    textAlign: "center",
    fontStyle: "italic",
  },
})

export default TemplateSelectionModal
