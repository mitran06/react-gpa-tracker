"use client"

// theme handling hook
import { useState, useEffect } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import type { Theme } from "../types"

export const useTheme = () => {
  const [darkMode, setDarkMode] = useState(true)

  useEffect(() => {
    // load dark mode setting from storage
    const loadDarkMode = async () => {
      try {
        const storedDarkMode = await AsyncStorage.getItem("darkMode")
        if (storedDarkMode !== null) {
          setDarkMode(JSON.parse(storedDarkMode))
        }
      } catch (error) {
        console.error("Error loading dark mode setting:", error)
      }
    }

    loadDarkMode()
  }, [])

  // save dark mode setting when it changes
  useEffect(() => {
    const saveDarkMode = async () => {
      try {
        await AsyncStorage.setItem("darkMode", JSON.stringify(darkMode))
      } catch (error) {
        console.error("Error saving dark mode setting:", error)
      }
    }

    saveDarkMode()
  }, [darkMode])

  const theme: Theme = {
    background: darkMode ? "#121212" : "#f5f5f5",
    card: darkMode ? "#1E1E1E" : "#ffffff",
    text: darkMode ? "#ffffff" : "#333333",
    subtext: darkMode ? "#888888" : "#666666",
    button: darkMode ? "#333333" : "#e0e0e0",
    primary: "#6200EE",
    border: darkMode ? "#333333" : "#e0e0e0",
    success: "#4CAF50",
    danger: "#F44336",
  }

  return { darkMode, setDarkMode, theme }
}
