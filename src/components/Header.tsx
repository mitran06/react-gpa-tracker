// header with semester tabs and controls
import { View, Text, ScrollView, TouchableOpacity, Animated, StyleSheet } from "react-native"
import { Feather } from "@expo/vector-icons"
import type { Semester, Theme } from "../types"

interface HeaderProps {
  semesters: Semester[]
  currentSemesterIndex: number
  theme: Theme
  headerOpacity: Animated.Value
  semesterScrollX: Animated.Value
  addButtonScale: Animated.Value
  setCurrentSemesterIndex: (index: number) => void
  setEditSemesterIndex: (index: number) => void
  setEditSemesterName: (name: string) => void
  setEditSemesterModal: (visible: boolean) => void
  deleteSemester: (index: number) => void
  setAddSemesterModal: (visible: boolean) => void
  onPressIn: () => void
  onPressOut: () => void
}

const Header = ({
  semesters,
  currentSemesterIndex,
  theme,
  headerOpacity,
  semesterScrollX,
  addButtonScale,
  setCurrentSemesterIndex,
  setEditSemesterIndex,
  setEditSemesterName,
  setEditSemesterModal,
  deleteSemester,
  setAddSemesterModal,
  onPressIn,
  onPressOut,
}: HeaderProps) => {
  return (
    <Animated.View
      style={[
        styles.headerContainer,
        {
          backgroundColor: theme.card,
          borderColor: theme.border,
          opacity: headerOpacity,
        },
      ]}
    >
      <View style={styles.headerContent}>
        <Text style={[styles.headerText, { color: theme.text, fontFamily: "Inter_700Bold" }]}>GPA Calculator</Text>
      </View>
      <Text style={[styles.subtitleText, { color: theme.subtext, fontFamily: "Inter_400Regular" }]}>
        Made with ♥ by Mitran
      </Text>

      {/* Semester Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.semesterTabs}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: semesterScrollX } } }], {
          useNativeDriver: false,
        })}
        scrollEventThrottle={16}
      >
        {semesters.map((semester, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.semesterTab,
              currentSemesterIndex === index && styles.activeSemesterTab,
              {
                backgroundColor: currentSemesterIndex === index ? theme.primary : theme.button,
                borderColor: theme.border,
              },
            ]}
            onPress={() => setCurrentSemesterIndex(index)}
            onLongPress={() => {
              setEditSemesterIndex(index)
              setEditSemesterName(semester.name)
              setEditSemesterModal(true)
            }}
          >
            <Text
              style={[
                styles.semesterTabText,
                {
                  color: currentSemesterIndex === index ? "#ffffff" : theme.text,
                  fontFamily: "Inter_500Medium",
                },
              ]}
              numberOfLines={1}
            >
              {semester.name}
            </Text>
            {currentSemesterIndex === index && semesters.length > 1 && (
              <TouchableOpacity style={styles.deleteSemesterButton} onPress={() => deleteSemester(index)}>
                <Feather name="x" size={12} color="#ffffff" />
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        ))}

        {/* Add Semester Button */}
        <Animated.View style={{ transform: [{ scale: addButtonScale }] }}>
          <TouchableOpacity
            style={[styles.addSemesterButton, { backgroundColor: theme.primary }]}
            onPress={() => setAddSemesterModal(true)}
            onPressIn={onPressIn}
            onPressOut={onPressOut}
          >
            <Feather name="plus" size={20} color="#ffffff" />
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  headerContainer: {
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  subtitleText: {
    fontSize: 12,
    marginTop: 2,
    marginBottom: 16,
    textAlign: "center",
  },
  semesterTabs: {
    flexDirection: "row",
    paddingVertical: 8,
  },
  semesterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  activeSemesterTab: {
    borderWidth: 0,
  },
  semesterTabText: {
    fontSize: 14,
    fontWeight: "500",
    maxWidth: 120,
  },
  deleteSemesterButton: {
    marginLeft: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  addSemesterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
})

export default Header
