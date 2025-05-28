// utility functions for gpa calculations
import { gradePoints } from "../constants/grades"
import type { Semester } from "../types"

export const calculateGPA = (semester: Semester): string => {
  if (!semester) return "0.00"

  let totalCredits = 0
  let weightedSum = 0

  semester.courses.forEach((course) => {
    if (course.grade) {
      const gradePoint = gradePoints[course.grade] || 0
      weightedSum += gradePoint * course.credits
      totalCredits += course.credits
    }
  })

  return totalCredits > 0 ? (weightedSum / totalCredits).toFixed(2) : "0.00"
}

export const calculateCumulativeGPA = (semesters: Semester[]): string => {
  let totalCredits = 0
  let weightedSum = 0

  semesters.forEach((semester) => {
    semester.courses.forEach((course) => {
      if (course.grade) {
        const gradePoint = gradePoints[course.grade] || 0
        weightedSum += gradePoint * course.credits
        totalCredits += course.credits
      }
    })
  })

  return totalCredits > 0 ? (weightedSum / totalCredits).toFixed(2) : "0.00"
}

// animate the gpa value for a smooth transition
export const animateGPAValue = (startValue: string, endValue: string, setValue: (value: string) => void) => {
  const duration = 500 // animation duration in ms
  const steps = 10 // number of steps in the animation
  const stepDuration = duration / steps
  const valueChange = Number.parseFloat(endValue) - Number.parseFloat(startValue)
  const stepValue = valueChange / steps

  let currentStep = 0
  const timer = setInterval(() => {
    currentStep++
    if (currentStep <= steps) {
      const newValue = (Number.parseFloat(startValue) + stepValue * currentStep).toFixed(2)
      setValue(newValue)
    } else {
      setValue(endValue) // Ensure we end at the exact target value
      clearInterval(timer)
    }
  }, stepDuration)
}
