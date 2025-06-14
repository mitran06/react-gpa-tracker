// hook for detecting first app launch
import { useState, useEffect } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"

export const useFirstLaunch = (userUid?: string) => {
  const [isFirstLaunch, setIsFirstLaunch] = useState(false)
  const [templateSelectionVisible, setTemplateSelectionVisible] = useState(false)
  const [appIsReady, setAppIsReady] = useState(false)

  // check if this is the first launch for the current user
  const checkFirstLaunch = async () => {
    try {
      if (!userUid) {
        // No user authenticated yet
        setAppIsReady(true)
        return
      }

      const hasLaunchedKey = `hasLaunched_${userUid}`
      const hasLaunched = await AsyncStorage.getItem(hasLaunchedKey)

      if (hasLaunched === null) {
        // first time this user is using the app
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
    if (userUid) {
      checkFirstLaunch()
    } else {
      setAppIsReady(true)
    }
  }, [userUid])

  const markAsLaunched = async () => {
    try {
      if (userUid) {
        const hasLaunchedKey = `hasLaunched_${userUid}`
        await AsyncStorage.setItem(hasLaunchedKey, "true")
      }
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
