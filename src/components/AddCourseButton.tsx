// button to add a new course to the current semester
import { TouchableOpacity, Text, StyleSheet } from "react-native"
import { Feather } from "@expo/vector-icons"
import type { Theme } from "../types"

interface AddCourseButtonProps {
  theme: Theme
  onPress: () => void
}

const AddCourseButton = ({ theme, onPress }: AddCourseButtonProps) => {
  return (
    <TouchableOpacity
      style={[styles.addCourseButton, { backgroundColor: theme.card, borderColor: theme.border }]}
      onPress={onPress}
    >
      <Feather name="plus" size={20} color={theme.primary} />
      <Text style={[styles.addCourseText, { color: theme.primary, fontFamily: "Inter_500Medium" }]}>Add Course</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  addCourseButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: "dashed",
  },
  addCourseText: {
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 8,
  },
})

export default AddCourseButton
