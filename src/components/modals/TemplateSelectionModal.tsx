import { View, Text, TouchableOpacity, Modal, StyleSheet } from "react-native"
import { Feather } from "@expo/vector-icons"
import type { Theme } from "../../types"
import { useColorScheme } from "react-native"

interface TemplateSelectionModalProps {
  visible: boolean
  theme: Theme
  handleTemplateSelection: (useDefaultTemplate: boolean) => void
}

const TemplateSelectionModal = ({ visible, theme, handleTemplateSelection }: TemplateSelectionModalProps) => {
  const colorScheme = useColorScheme()
  const darkMode = colorScheme === "dark"

  return (
    <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={() => {}}>
      <View style={[styles.modalOverlay, { backgroundColor: darkMode ? "rgba(0, 0, 0, 0.9)" : "rgba(0, 0, 0, 0.7)" }]}>
        <View style={[styles.welcomeModalContent, { backgroundColor: theme.card }]}>
          <Text style={[styles.welcomeTitle, { color: theme.text, fontFamily: "Inter_700Bold" }]}>
            Welcome to GPA Calculator
          </Text>

          <Text style={[styles.welcomeText, { color: theme.subtext, fontFamily: "Inter_400Regular" }]}>
            Choose how you'd like to start:
          </Text>

          <View style={styles.templateOptions}>
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
  welcomeNote: {
    fontSize: 12,
    textAlign: "center",
    fontStyle: "italic",
  },
})

export default TemplateSelectionModal
