import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet } from "react-native"
import type { Theme } from "../../types"

interface EditSemesterModalProps {
  visible: boolean
  theme: Theme
  editSemesterName: string
  setEditSemesterName: (name: string) => void
  editSemester: () => void
  onClose: () => void
}

const EditSemesterModal = ({
  visible,
  theme,
  editSemesterName,
  setEditSemesterName,
  editSemester,
  onClose,
}: EditSemesterModalProps) => {
  return (
    <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
          <Text style={[styles.modalTitle, { color: theme.text, fontFamily: "Inter_700Bold" }]}>Edit Semester</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.button, color: theme.text, fontFamily: "Inter_400Regular" }]}
            placeholder="Semester Name"
            placeholderTextColor={theme.subtext}
            value={editSemesterName}
            onChangeText={setEditSemesterName}
          />
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton, { borderColor: theme.border }]}
              onPress={onClose}
            >
              <Text style={[styles.modalButtonText, { color: theme.text, fontFamily: "Inter_500Medium" }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.confirmButton, { backgroundColor: theme.primary }]}
              onPress={editSemester}
            >
              <Text style={[styles.modalButtonText, { color: "#ffffff", fontFamily: "Inter_500Medium" }]}>Save</Text>
            </TouchableOpacity>
          </View>
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
  modalContent: {
    width: "85%",
    padding: 20,
    borderRadius: 12,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  input: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    marginRight: 8,
    borderWidth: 1,
  },
  confirmButton: {
    marginLeft: 8,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: "500",
  },
})

export default EditSemesterModal
