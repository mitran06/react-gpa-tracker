// component that displays current semester and cumulative gpa
import { View, Text, Animated, StyleSheet } from "react-native"
import type { Theme } from "../types"

interface GPADisplayProps {
  displaySemesterGPA: string
  displayCumulativeGPA: string
  theme: Theme
  scaleAnim: Animated.Value
}

const GPADisplay = ({ displaySemesterGPA, displayCumulativeGPA, theme, scaleAnim }: GPADisplayProps) => {
  return (
    <Animated.View
      style={[
        styles.gpaContainer,
        {
          backgroundColor: theme.primary,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <View style={styles.gpaContent}>
        <View>
          <Text style={[styles.gpaLabel, { color: "#ffffff", fontFamily: "Inter_400Regular" }]}>Semester GPA:</Text>
          <Text style={[styles.gpaValue, { color: "#ffffff", fontFamily: "Inter_700Bold" }]}>{displaySemesterGPA}</Text>
        </View>
        <View style={styles.gpaDivider} />
        <View>
          <Text style={[styles.gpaLabel, { color: "#ffffff", fontFamily: "Inter_400Regular" }]}>Cumulative GPA:</Text>
          <Text style={[styles.gpaValue, { color: "#ffffff", fontFamily: "Inter_700Bold" }]}>
            {displayCumulativeGPA}
          </Text>
        </View>
      </View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  gpaContainer: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    borderRadius: 12,
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  gpaContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
  },
  gpaDivider: {
    width: 1,
    height: 40,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  gpaLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
  gpaValue: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 4,
  },
})

export default GPADisplay
