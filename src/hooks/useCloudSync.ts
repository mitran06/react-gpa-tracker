import { useEffect, useState, useCallback } from 'react'
import { UserDataService, type UserCloudData } from '../services/UserDataService'
import { useAuth } from '../contexts/AuthContext'
import type { Semester } from '../types'

interface TemplateInfo {
  name: string
  isDefault: boolean
  isCustom: boolean
  templateId?: string
}

interface CloudSyncOptions {
  enableAutoSync: boolean
  syncInterval: number // in milliseconds
}

export const useCloudSync = (
  semesters: Semester[],
  setSemesters: (semesters: Semester[]) => void,
  templateInfo: TemplateInfo,
  settings: { darkMode: boolean; persistentLogin: boolean },
  options: CloudSyncOptions = { enableAutoSync: true, syncInterval: 30000 } // 30 seconds
) => {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null)
  const [cloudData, setCloudData] = useState<UserCloudData | null>(null)
  const [syncError, setSyncError] = useState<string | null>(null)
  const [hasCloudData, setHasCloudData] = useState(false)

  /**
   * Load user data from cloud when component mounts or user changes
   */
  const loadFromCloud = useCallback(async () => {
    if (!user?.uid) return null

    try {
      setIsLoading(true)
      setSyncError(null)
      
      const userData = await UserDataService.loadUserData(user.uid)
      setCloudData(userData)
      setHasCloudData(!!userData)
        if (userData) {
        // Data loaded from cloud silently
        setLastSyncTime(new Date())
      }
      
      return userData
    } catch (error) {
      console.error('❌ Error loading from cloud:', error)
      setSyncError('Failed to load data from cloud')
      return null
    } finally {
      setIsLoading(false)
    }
  }, [user?.uid])

  /**
   * Save current data to cloud
   */
  const saveToCloud = useCallback(async (force = false) => {
    if (!user?.uid) return false

    try {
      setSyncError(null)
      
      await UserDataService.saveUserData(
        user.uid,
        semesters,
        templateInfo,
        settings
      )
        setLastSyncTime(new Date())
      setHasCloudData(true)
      // Data saved to cloud silently
      return true
    } catch (error) {
      console.error('❌ Error saving to cloud:', error)
      setSyncError('Failed to save data to cloud')
      return false
    }
  }, [user?.uid, semesters, templateInfo, settings])

  /**
   * Quick update for active template (during GPA calculations)
   */
  const updateTemplateInCloud = useCallback(async () => {
    if (!user?.uid) return false

    try {      await UserDataService.updateActiveTemplate(user.uid, semesters, templateInfo)
      setLastSyncTime(new Date())
      // Template updated in cloud silently
      return true
    } catch (error) {
      console.error('❌ Error updating template in cloud:', error)
      setSyncError('Failed to update template in cloud')
      return false
    }
  }, [user?.uid, semesters, templateInfo])

  /**
   * Update settings in cloud
   */
  const updateSettingsInCloud = useCallback(async () => {
    if (!user?.uid) return false

    try {      await UserDataService.updateSettings(user.uid, settings)
      setLastSyncTime(new Date())
      // Settings updated in cloud silently
      return true
    } catch (error) {
      console.error('❌ Error updating settings in cloud:', error)
      setSyncError('Failed to update settings in cloud')
      return false
    }
  }, [user?.uid, settings])

  /**
   * Restore semesters from cloud data
   */
  const restoreFromCloud = useCallback((userData: UserCloudData) => {    if (userData.activeTemplate.semesters) {
      setSemesters(userData.activeTemplate.semesters)
      // Restored semesters from cloud data silently
      return true
    }
    return false
  }, [setSemesters])

  /**
   * Check if cloud data is newer than local data
   */
  const isCloudDataNewer = useCallback((userData: UserCloudData): boolean => {
    if (!lastSyncTime || !userData.lastUpdated) return true
    
    const cloudTime = userData.lastUpdated.toDate ? userData.lastUpdated.toDate() : new Date(userData.lastUpdated)
    return cloudTime > lastSyncTime
  }, [lastSyncTime])

  // Load cloud data on mount
  useEffect(() => {
    loadFromCloud()
  }, [loadFromCloud])

  // Auto-sync functionality
  useEffect(() => {
    if (!options.enableAutoSync || !user?.uid) return

    const interval = setInterval(() => {
      updateTemplateInCloud()
    }, options.syncInterval)

    return () => clearInterval(interval)
  }, [options.enableAutoSync, options.syncInterval, updateTemplateInCloud, user?.uid])

  // Clear state when user logs out
  useEffect(() => {
    if (!user) {
      setCloudData(null)
      setHasCloudData(false)
      setLastSyncTime(null)
      setSyncError(null)
    }
  }, [user])

  return {
    // State
    isLoading,
    lastSyncTime,
    cloudData,
    syncError,
    hasCloudData,
    
    // Actions
    loadFromCloud,
    saveToCloud,
    updateTemplateInCloud,
    updateSettingsInCloud,
    restoreFromCloud,
    isCloudDataNewer,
    
    // Utilities
    clearSyncError: () => setSyncError(null)
  }
}
