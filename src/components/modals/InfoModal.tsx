import { View, Text, TouchableOpacity, Modal, ScrollView, StyleSheet } from "react-native"
import { gradePoints } from "../../constants/grades"
import type { Theme } from "../../types"

interface InfoModalProps {
  visible: boolean
  theme: Theme
  onClose: () => void
}

const InfoModal = ({ visible, theme, onClose }: InfoModalProps) => {
  return (
    <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.infoModalContent, { backgroundColor: theme.card }]}>
          <Text style={[styles.infoModalTitle, { color: theme.text, fontFamily: "Inter_700Bold" }]}>
            GPA Calculation
          </Text>
          <ScrollView style={styles.infoModalScroll}>
            <Text style={[styles.infoModalText, { color: theme.text, fontFamily: "Inter_400Regular" }]}>
              This app calculates your GPA based on the following grade points:
            </Text>
            <View style={styles.gradePointsTable}>
              {Object.entries(gradePoints).map(([grade, point]) => (
                <View key={grade} style={styles.gradePointRow}>
                  <Text style={[styles.gradePointGrade, { color: theme.text, fontFamily: "Inter_500Medium" }]}>
                    {grade}
                  </Text>
                  <Text style={[styles.gradePointValue, { color: theme.text, fontFamily: "Inter_400Regular" }]}>
                    {point}
                  </Text>
                </View>
              ))}
            </View>
            <Text style={[styles.infoModalText, { color: theme.text, marginTop: 16, fontFamily: "Inter_400Regular" }]}>
              The formula used is:
            </Text>
            <View style={[styles.formulaBox, { backgroundColor: theme.button }]}>
              <Text style={[styles.formulaText, { color: theme.text, fontFamily: "Inter_500Medium" }]}>
                GPA = Σ(Grade Point × Credit) / Σ(Credit)
              </Text>
            </View>
            <Text style={[styles.infoModalText, { color: theme.text, marginTop: 16, fontFamily: "Inter_500Medium" }]}>
              Tips:
            </Text>
            <Text style={[styles.infoModalText, { color: theme.subtext, fontFamily: "Inter_400Regular" }]}>
              • Long press on a semester tab to edit its name{"\n"}• Add multiple semesters to track your progress
              {"\n"}• Your data is automatically saved
            </Text>
          </ScrollView>
          <TouchableOpacity style={[styles.infoModalButton, { backgroundColor: theme.primary }]} onPress={onClose}>
            <Text style={[styles.infoModalButtonText, { color: "#ffffff", fontFamily: "Inter_500Medium" }]}>
              Got it
            </Text>
          </TouchableOpacity>
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
  infoModalContent: {
    width: "85%",
    maxHeight: "80%",
    padding: 20,
    borderRadius: 12,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  infoModalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  infoModalScroll: {
    maxHeight: 400,
  },
  infoModalText: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
  gradePointsTable: {
    marginTop: 8,
  },
  gradePointRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(150, 150, 150, 0.2)",
  },
  gradePointGrade: {
    fontSize: 14,
    fontWeight: "500",
  },
  gradePointValue: {
    fontSize: 14,
  },
  formulaBox: {
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  formulaText: {
    fontSize: 14,
    textAlign: "center",
  },
  infoModalButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },
  infoModalButtonText: {
    fontSize: 16,
    fontWeight: "500",
  },
})

export default InfoModal
