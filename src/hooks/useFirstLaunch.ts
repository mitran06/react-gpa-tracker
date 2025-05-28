"use client"

// hook for detecting first app launch
import { useState, useEffect } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import * as SplashScreen from "expo-splash-screen"

export const useFirstLaunch = () => {
  const [isFirstLaunch, setIsFirstLaunch] = useState(false)
  const [templateSelectionVisible, setTemplateSelectionVisible] = useState(false)
  const [appIsReady, setAppIsReady] = useState(false)

  // check if this is the first launch
  const checkFirstLaunch = async () => {
    try {
      // keep splash screen visible during check
      await SplashScreen.preventAutoHideAsync()
      const hasLaunched = await AsyncStorage.getItem("hasLaunched")

      if (hasLaunched === null) {
        // first time launching the app
        setIsFirstLaunch(true)
        setTemplateSelectionVisible(true)
      }
    } catch (error) {
      console.error("Error checking first launch:", error)
    } finally {
      setAppIsReady(true)
    }
  }

  useEffect(() => {
    checkFirstLaunch()
  }, [])

  const markAsLaunched = async () => {
    try {
      await AsyncStorage.setItem("hasLaunched", "true")
      setIsFirstLaunch(false)
    } catch (error) {
      console.error("Error marking as launched:", error)
    }
  }

  return {
    isFirstLaunch,
    setIsFirstLaunch,
    templateSelectionVisible,
    setTemplateSelectionVisible,
    appIsReady,
    setAppIsReady,
    markAsLaunched,
    checkFirstLaunch,
  }
}
