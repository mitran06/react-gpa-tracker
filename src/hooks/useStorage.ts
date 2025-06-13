// hook for handling persistent local storage
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
        console.log('📱 Loaded local data for user:', userUid)
        return parsedSemesters
      } else {
        // no stored data for this user, start empty for template selection
        setSemesters([])
        console.log('📭 No local data found for user:', userUid)
        return []
      }
    } catch (error) {
      console.error("Error loading local data:", error)
      // use empty array if there's an error
      setSemesters([])
      return []
    }
  }

  // save data to local storage
  const saveData = async (newSemesters: Semester[]) => {
    try {
      if (userUid) {
        const semestersKey = `semesters_${userUid}`
        await AsyncStorage.setItem(semestersKey, JSON.stringify(newSemesters))
        console.log('💾 Saved local data for user:', userUid)
      }
    } catch (error) {
      console.error("Error saving local data:", error)
    }
  }
  // save template info to local storage
  const saveTemplateInfo = async (templateInfo: {
    name: string
    isDefault: boolean
    isCustom: boolean
    templateId?: string
  }) => {
    try {
      if (userUid) {
        const templateInfoKey = `templateInfo_${userUid}`
        await AsyncStorage.setItem(templateInfoKey, JSON.stringify(templateInfo))
        console.log('📋 Saved template info for user:', userUid)
      }
    } catch (error) {
      console.error("Error saving template info:", error)
    }
  }

  // load template info from local storage
  const loadTemplateInfo = async () => {
    try {
      if (!userUid) return null

      const templateInfoKey = `templateInfo_${userUid}`
      const storedTemplateInfo = await AsyncStorage.getItem(templateInfoKey)

      if (storedTemplateInfo) {
        const parsedTemplateInfo = JSON.parse(storedTemplateInfo)
        console.log('📋 Loaded template info for user:', userUid)
        return parsedTemplateInfo
      } else {
        console.log('📭 No template info found for user:', userUid)
        return null
      }
    } catch (error) {
      console.error("Error loading template info:", error)
      return null
    }
  }

  // clear user data from local storage
  const clearUserData = async () => {
    try {
      if (userUid) {
        const semestersKey = `semesters_${userUid}`
        const templateInfoKey = `templateInfo_${userUid}`
        await AsyncStorage.removeItem(semestersKey)
        await AsyncStorage.removeItem(templateInfoKey)
        setSemesters([])
        console.log('🗑️ Cleared local data for user:', userUid)
      }
    } catch (error) {
      console.error("Error clearing user data:", error)
    }
  }

  // auto-save whenever semesters change (but not on first launch)
  useEffect(() => {
    if (!isFirstLaunch && semesters.length > 0 && userUid) {
      saveData(semesters)
    }
  }, [semesters, isFirstLaunch, userUid])

  return { 
    semesters, 
    setSemesters, 
    loadSavedData, 
    saveData,
    saveTemplateInfo,
    loadTemplateInfo,
    clearUserData
  }
}
