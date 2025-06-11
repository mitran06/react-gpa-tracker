// hook for handling persistent storage
import { useState, useEffect } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import type { Semester } from "../types"
import { defaultSemesters } from "../constants/templates"

export const useStorage = (isFirstLaunch: boolean, userUid?: string) => {
  const [semesters, setSemesters] = useState<Semester[]>([])

  // load data from async storage
  const loadSavedData = async () => {
    try {
      if (!userUid) {
        setSemesters([])
        return []
      }

      const semestersKey = `semesters_${userUid}`
      const storedSemesters = await AsyncStorage.getItem(semestersKey)

      if (storedSemesters) {
        const parsedSemesters = JSON.parse(storedSemesters)
        setSemesters(parsedSemesters)
        return parsedSemesters
      } else {
        // no stored data for this user, start empty for template selection
        setSemesters([])
        return []
      }
    } catch (error) {
      console.error("Error loading data:", error)
      // use empty array if there's an error
      setSemesters([])
      return []
    }
  }

  // save data to storage
  const saveData = async (newSemesters: Semester[]) => {
    try {
      if (userUid) {
        const semestersKey = `semesters_${userUid}`
        await AsyncStorage.setItem(semestersKey, JSON.stringify(newSemesters))
      }
    } catch (error) {
      console.error("Error saving data:", error)
    }
  }

  // auto-save whenever semesters change
  useEffect(() => {
    if (!isFirstLaunch && semesters.length > 0 && userUid) {
      saveData(semesters)
    }
  }, [semesters, isFirstLaunch, userUid])

  return { semesters, setSemesters, loadSavedData, saveData }
}
