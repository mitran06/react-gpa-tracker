// card component to display course info with grade selection
import { View, Text, TouchableOpacity, StyleSheet, Animated } from "react-native"
import { Feather } from "@expo/vector-icons"
import type { Course } from "../types"
import { mainGrades, extraGrades } from "../constants/grades"
import type { Theme } from "../types"

interface CourseCardProps {
  course: Course
  index: number
  showMore: boolean[]
  theme: Theme
  fadeAnim: Animated.Value
  toggleShowMore: (index: number) => void
  handleGradeChange: (courseIndex: number, value: string) => void
  editCourse: (index: number) => void
  deleteCourse: (index: number) => void
}

const CourseCard = ({
  course,
  index,
  showMore,
  theme,
  fadeAnim,
  toggleShowMore,
  handleGradeChange,
  editCourse,
  deleteCourse,
}: CourseCardProps) => {
  return (
    <Animated.View
      style={[
        styles.card,
        {
          backgroundColor: theme.card,
          borderColor: theme.border,
          transform: [
            {
              scale: course.grade ? 1 : 0.98,
            },
          ],
        },
      ]}
    >
      <View style={styles.courseHeader}>
        <Text style={[styles.courseName, { color: theme.text, fontFamily: "Inter_500Medium" }]}>
          {course.name} ({course.credits} Credits)
        </Text>
        <View style={styles.courseActions}>
          <TouchableOpacity
            style={[styles.courseActionButton, { backgroundColor: theme.button }]}
            onPress={() => editCourse(index)}
          >
            <Feather name="edit" size={14} color={theme.text} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.courseActionButton, { backgroundColor: theme.danger }]}
            onPress={() => deleteCourse(index)}
          >
            <Feather name="trash-2" size={14} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.grid}>
        {mainGrades.map((grade) => (
          <TouchableOpacity
            key={grade}
            style={[
              styles.gridButton,
              course.grade === grade && styles.selectedButton,
              { backgroundColor: course.grade === grade ? theme.primary : theme.button },
            ]}
            onPress={() => handleGradeChange(index, grade)}
          >
            <Text
              style={[
                styles.gridText,
                {
                  color: course.grade === grade ? "#ffffff" : theme.text,
                  fontFamily: "Inter_700Bold",
                },
              ]}
            >
              {grade}
            </Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          style={[styles.gridButton, { backgroundColor: theme.button }]}
          onPress={() => toggleShowMore(index)}
        >
          {showMore[index] ? (
            <Feather name="chevron-up" size={20} color={theme.text} />
          ) : (
            <Feather name="chevron-down" size={20} color={theme.text} />
          )}
        </TouchableOpacity>
      </View>

      <Animated.View
        style={{
          opacity: fadeAnim,
          height: fadeAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 55],
          }),
          marginTop: 8,
          overflow: "hidden",
        }}
      >
        <View style={styles.grid}>
          {extraGrades.map((grade) => (
            <TouchableOpacity
              key={grade}
              style={[
                styles.gridButton,
                course.grade === grade && styles.selectedButton,
                { backgroundColor: course.grade === grade ? theme.primary : theme.button },
              ]}
              onPress={() => handleGradeChange(index, grade)}
            >
              <Text
                style={[
                  styles.gridText,
                  {
                    color: course.grade === grade ? "#ffffff" : theme.text,
                    fontFamily: "Inter_700Bold",
                  },
                ]}
              >
                {grade}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  courseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  courseName: {
    fontSize: 16,
    flex: 1,
  },
  courseActions: {
    flexDirection: "row",
  },
  courseActionButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "nowrap",
    justifyContent: "space-between",
    alignItems: "center",
  },
  gridButton: {
    flex: 1,
    marginHorizontal: 3,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  selectedButton: {
    backgroundColor: "#6200EE",
  },
  gridText: {
    fontWeight: "bold",
  },
})

export default CourseCard
