"use client"

// hook for handling persistent storage
import { useState, useEffect } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import type { Semester } from "../types"
import { defaultSemesters } from "../constants/templates"

export const useStorage = (isFirstLaunch: boolean) => {
  const [semesters, setSemesters] = useState<Semester[]>([])

  // load data from async storage
  const loadSavedData = async () => {
    try {
      const storedSemesters = await AsyncStorage.getItem("semesters")

      if (storedSemesters) {
        const parsedSemesters = JSON.parse(storedSemesters)
        setSemesters(parsedSemesters)
        return parsedSemesters
      } else {
        // no stored data, use default
        setSemesters([...defaultSemesters])
        return defaultSemesters
      }
    } catch (error) {
      console.error("Error loading data:", error)
      // use defaults if there's an error
      setSemesters([...defaultSemesters])
      return defaultSemesters
    }
  }

  // save data to storage
  const saveData = async (newSemesters: Semester[]) => {
    try {
      await AsyncStorage.setItem("semesters", JSON.stringify(newSemesters))
    } catch (error) {
      console.error("Error saving data:", error)
    }
  }

  // auto-save whenever semesters change
  useEffect(() => {
    if (!isFirstLaunch && semesters.length > 0) {
      saveData(semesters)
    }
  }, [semesters, isFirstLaunch])

  return { semesters, setSemesters, loadSavedData, saveData }
}
