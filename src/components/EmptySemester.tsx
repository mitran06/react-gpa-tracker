// empty state component when no semesters or courses exist
import { View, Text, TouchableOpacity, StyleSheet } from "react-native"
import type { Theme } from "../types"

interface EmptySemesterProps {
  semestersLength: number
  theme: Theme
  setAddSemesterModal: (visible: boolean) => void
  setNewCourseName: (name: string) => void
  setNewCourseCredits: (credits: string) => void
  setEditCourseIndex: (index: number) => void
  setAddCourseModal: (visible: boolean) => void
}

const EmptySemester = ({
  semestersLength,
  theme,
  setAddSemesterModal,
  setNewCourseName,
  setNewCourseCredits,
  setEditCourseIndex,
  setAddCourseModal,
}: EmptySemesterProps) => {
  return (
    <View style={styles.emptySemesterContainer}>
      <Text style={[styles.emptySemesterText, { color: theme.text, fontFamily: "Inter_400Regular" }]}>
        {semestersLength === 0
          ? "No semesters found. Add a semester to get started!"
          : "No courses in this semester. Add a course to get started!"}
      </Text>
      <TouchableOpacity
        style={[styles.emptySemesterButton, { backgroundColor: theme.primary }]}
        onPress={() => {
          if (semestersLength === 0) {
            setAddSemesterModal(true)
          } else {
            setNewCourseName("")
            setNewCourseCredits("")
            setEditCourseIndex(-1)
            setAddCourseModal(true)
          }
        }}
      >
        <Text style={[styles.emptySemesterButtonText, { color: "#ffffff", fontFamily: "Inter_500Medium" }]}>
          {semestersLength === 0 ? "Add Semester" : "Add Course"}
        </Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  emptySemesterContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptySemesterText: {
    fontSize: 16,
    textAlign: "center",
    marginVertical: 20,
  },
  emptySemesterButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptySemesterButtonText: {
    fontSize: 16,
    fontWeight: "500",
  },
})

export default EmptySemester
