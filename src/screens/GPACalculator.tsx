// main calculator screen
import { useState, useEffect, useRef, useCallback } from "react"
import { ScrollView, StyleSheet, SafeAreaView, TouchableOpacity, Animated, StatusBar, Alert } from "react-native"
import { Feather } from "@expo/vector-icons"
import * as SplashScreen from "expo-splash-screen"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_700Bold } from "@expo-google-fonts/inter"

// ui components
import Header from "../components/Header"
import CourseCard from "../components/CourseCard"
import GPADisplay from "../components/GPADisplay"
import EmptySemester from "../components/EmptySemester"
import AddCourseButton from "../components/AddCourseButton"

// all modals
import TemplateSelectionModal from "../components/modals/TemplateSelectionModal"
import AddSemesterModal from "../components/modals/AddSemesterModal"
import EditSemesterModal from "../components/modals/EditSemesterModal"
import AddCourseModal from "../components/modals/AddCourseModal"
import SettingsModal from "../components/modals/SettingsModal"
import InfoModal from "../components/modals/InfoModal"

// screens
import LoginScreen from "./LoginScreen"
import TemplateSubmissionScreen from "./TemplateSubmissionScreen"
import AdminScreen from "./AdminScreen"

// custom hooks
import { useTheme } from "../hooks/useTheme"
import { useFirstLaunch } from "../hooks/useFirstLaunch"
import { useStorage } from "../hooks/useStorage"

// contexts
import { useAuth } from "../contexts/AuthContext"

// calculation utilities
import { calculateGPA, calculateCumulativeGPA, animateGPAValue } from "../utils/calculations"

// templates
import { defaultSemesters, emptyTemplate } from "../constants/templates"

// types
import { Template, Semester, Course } from "../types"

const GPACalculator = () => {
  // font loading
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_700Bold,
  })

  // authentication
  const { user, loading: authLoading, logout, isAdmin } = useAuth()

  // first launch detection and template selection
  const {
    isFirstLaunch,
    setIsFirstLaunch,
    templateSelectionVisible,
    setTemplateSelectionVisible,
    appIsReady,
    setAppIsReady, // added setAppIsReady from useFirstLaunch hook
    markAsLaunched,
    checkFirstLaunch,
  } = useFirstLaunch()

  // theme stuff
  const { darkMode, setDarkMode, theme } = useTheme()

  // async storage handling
  const { semesters, setSemesters, loadSavedData } = useStorage(isFirstLaunch)

  // screen navigation state
  const [currentScreen, setCurrentScreen] = useState<'calculator' | 'templateSubmission' | 'admin'>('calculator')

  // state variables
  const [currentSemesterIndex, setCurrentSemesterIndex] = useState(0)
  const [showMore, setShowMore] = useState<boolean[]>([])
  const [scaleAnim] = useState(new Animated.Value(0.95))
  const [settingsVisible, setSettingsVisible] = useState(false)
  const [addSemesterModal, setAddSemesterModal] = useState(false)
  const [newSemesterName, setNewSemesterName] = useState("")
  const [addCourseModal, setAddCourseModal] = useState(false)
  const [newCourseName, setNewCourseName] = useState("")
  const [newCourseCredits, setNewCourseCredits] = useState("")
  const [editCourseIndex, setEditCourseIndex] = useState(-1)
  const [editSemesterIndex, setEditSemesterIndex] = useState(-1)
  const [editSemesterModal, setEditSemesterModal] = useState(false)
  const [editSemesterName, setEditSemesterName] = useState("")
  const [infoModalVisible, setInfoModalVisible] = useState(false)
  const [displaySemesterGPA, setDisplaySemesterGPA] = useState("0.00")
  const [displayCumulativeGPA, setDisplayCumulativeGPA] = useState("0.00")

  // ref to store fadeAnim values for each course
  const fadeAnimRef = useRef<Record<string, Animated.Value>>({})

  // animation refs
  const addButtonScale = new Animated.Value(1)
  const headerOpacity = new Animated.Value(1)
  const semesterScrollX = new Animated.Value(0)

  // handle app loading and font loading
  useEffect(() => {
    async function prepare() {
      try {
        // keep splash screen visible while checking first launch
        await SplashScreen.preventAutoHideAsync()
        await checkFirstLaunch()
      } catch (e) {
        console.warn(e)
      } finally {
        setAppIsReady(true)
      }
    }

    prepare()
  }, [])

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady && fontsLoaded) {
      await SplashScreen.hideAsync()
    }
  }, [appIsReady, fontsLoaded])

  // helper to get fadeAnim for a specific course
  const getFadeAnim = (semesterIndex: number, courseIndex: number) => {
    const key = `${semesterIndex}-${courseIndex}`
    if (!fadeAnimRef.current[key]) {
      fadeAnimRef.current[key] = new Animated.Value(0)
    }
    return fadeAnimRef.current[key]
  }

  // update showMore array when current semester changes
  useEffect(() => {
    if (semesters[currentSemesterIndex]) {
      setShowMore(Array(semesters[currentSemesterIndex].courses.length).fill(false))
    }
  }, [currentSemesterIndex, semesters])

  // calculate and update gpa values
  useEffect(() => {
    if (semesters.length > 0) {
      // calculate new semester gpa
      const newSemesterGPA = calculateGPA(semesters[currentSemesterIndex])

      // calculate new cumulative gpa
      const newCumulativeGPA = calculateCumulativeGPA(semesters)

      // don't animate on initial load or when switching semesters
      if (
        displaySemesterGPA === "0.00" ||
        Math.abs(Number.parseFloat(displaySemesterGPA) - Number.parseFloat(newSemesterGPA)) > 1
      ) {
        setDisplaySemesterGPA(newSemesterGPA)
      } else {
        animateGPAValue(displaySemesterGPA, newSemesterGPA, setDisplaySemesterGPA)
      }

      if (
        displayCumulativeGPA === "0.00" ||
        Math.abs(Number.parseFloat(displayCumulativeGPA) - Number.parseFloat(newCumulativeGPA)) > 1
      ) {
        setDisplayCumulativeGPA(newCumulativeGPA)
      } else {
        animateGPAValue(displayCumulativeGPA, newCumulativeGPA, setDisplayCumulativeGPA)
      }
    }
  }, [semesters, currentSemesterIndex])

  // Handle template selection
  const handleTemplateSelection = async (useDefaultTemplate: boolean, firebaseTemplate?: Template) => {
    try {
      // Mark that the app has been launched
      await markAsLaunched()

      // Set the selected template
      let selectedTemplate: Semester[]
      
      if (firebaseTemplate) {
        // Use Firebase template
        selectedTemplate = firebaseTemplate.structure.semesters
      } else if (useDefaultTemplate) {
        // Use default template
        selectedTemplate = [...defaultSemesters]
      } else {
        // Use empty template
        selectedTemplate = [...emptyTemplate]
      }
      
      setSemesters(selectedTemplate)

      // Initialize showMore array
      if (selectedTemplate.length > 0) {
        setShowMore(Array(selectedTemplate[0].courses.length).fill(false))
      }

      // Initialize fadeAnim values
      const initialFadeAnims: Record<string, Animated.Value> = {}
      selectedTemplate.forEach((semester, semesterIdx) => {
        semester.courses.forEach((_: Course, courseIdx: number) => {
          const key = `${semesterIdx}-${courseIdx}`
          initialFadeAnims[key] = new Animated.Value(0)
        })
      })
      fadeAnimRef.current = initialFadeAnims

      // Save the selected template
      await AsyncStorage.setItem("semesters", JSON.stringify(selectedTemplate))

      // Close the modal
      setTemplateSelectionVisible(false)
    } catch (error) {
      console.error("Error setting template:", error)
      // Use defaults if there's an error
      setSemesters([...defaultSemesters])
    }
  }

  const toggleShowMore = (index: number) => {
    const newShowMore = [...showMore]
    newShowMore[index] = !newShowMore[index]
    setShowMore(newShowMore)

    Animated.timing(getFadeAnim(currentSemesterIndex, index), {
      toValue: newShowMore[index] ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start()
  }

  const handleGradeChange = (courseIndex: number, value: string) => {
    const newSemesters = [...semesters]
    newSemesters[currentSemesterIndex].courses[courseIndex].grade = value

    // update semester data
    setSemesters(newSemesters)
  }

  const addSemester = () => {
    if (!newSemesterName.trim()) {
      Alert.alert("Error", "Please enter a semester name")
      return
    }

    const newSemester = {
      name: newSemesterName,
      courses: [],
    }

    setSemesters([...semesters, newSemester])
    setCurrentSemesterIndex(semesters.length)
    setNewSemesterName("")
    setAddSemesterModal(false)
  }

  const deleteSemester = (index: number) => {
    Alert.alert("Delete Semester", `Are you sure you want to delete ${semesters[index].name}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          const newSemesters = [...semesters]
          newSemesters.splice(index, 1)
          setSemesters(newSemesters)

          if (currentSemesterIndex >= newSemesters.length) {
            setCurrentSemesterIndex(Math.max(0, newSemesters.length - 1))
          }
        },
      },
    ])
  }

  const addOrEditCourse = () => {
    if (!newCourseName.trim()) {
      Alert.alert("Error", "Please enter a course name")
      return
    }

    if (!newCourseCredits.trim() || isNaN(Number.parseFloat(newCourseCredits))) {
      Alert.alert("Error", "Please enter valid credits")
      return
    }

    const newSemesters = [...semesters]
    const newCourse = {
      name: newCourseName,
      credits: Number.parseFloat(newCourseCredits),
      grade: "",
    }

    if (editCourseIndex >= 0) {
      // Edit existing course
      newSemesters[currentSemesterIndex].courses[editCourseIndex] = newCourse
    } else {
      // Add new course
      newSemesters[currentSemesterIndex].courses.push(newCourse)

      // Update showMore array
      setShowMore([...showMore, false])

      // Create a new fadeAnim for the new course
      const newCourseIndex = newSemesters[currentSemesterIndex].courses.length - 1
      const key = `${currentSemesterIndex}-${newCourseIndex}`
      fadeAnimRef.current[key] = new Animated.Value(0)
    }

    setSemesters(newSemesters)
    setNewCourseName("")
    setNewCourseCredits("")
    setEditCourseIndex(-1)
    setAddCourseModal(false)
  }

  const editCourse = (index: number) => {
    const course = semesters[currentSemesterIndex].courses[index]
    setNewCourseName(course.name)
    setNewCourseCredits(course.credits.toString())
    setEditCourseIndex(index)
    setAddCourseModal(true)
  }

  const deleteCourse = (index: number) => {
    Alert.alert(
      "Delete Course",
      `Are you sure you want to delete ${semesters[currentSemesterIndex].courses[index].name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            const newSemesters = [...semesters]
            newSemesters[currentSemesterIndex].courses.splice(index, 1)
            setSemesters(newSemesters)

            // update expand state array
            const newShowMore = [...showMore]
            newShowMore.splice(index, 1)
            setShowMore(newShowMore)

            // cleanup animation refs for the deleted course
            const newFadeAnimRef = { ...fadeAnimRef.current }
            // shift all keys for courses after the deleted one
            for (let i = index; i < newSemesters[currentSemesterIndex].courses.length; i++) {
              const nextKey = `${currentSemesterIndex}-${i + 1}`
              const currentKey = `${currentSemesterIndex}-${i}`
              newFadeAnimRef[currentKey] = newFadeAnimRef[nextKey]
            }
            // remove the last one
            delete newFadeAnimRef[`${currentSemesterIndex}-${newSemesters[currentSemesterIndex].courses.length}`]
            fadeAnimRef.current = newFadeAnimRef
          },
        },
      ],
    )
  }

  const editSemester = () => {
    if (!editSemesterName.trim()) {
      Alert.alert("Error", "Please enter a semester name")
      return
    }

    const newSemesters = [...semesters]
    newSemesters[editSemesterIndex].name = editSemesterName
    setSemesters(newSemesters)
    setEditSemesterName("")
    setEditSemesterIndex(-1)
    setEditSemesterModal(false)
  }

  const resetAllData = () => {
    Alert.alert(
      "Reset All Data",
      "Are you sure you want to reset all data? This will delete all semesters and courses.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            try {
              // wipe all storage
              await AsyncStorage.removeItem("semesters")
              await AsyncStorage.removeItem("hasLaunched")

              // reset app to initial state
              setSemesters([])
              setCurrentSemesterIndex(0)
              setIsFirstLaunch(true)
              setTemplateSelectionVisible(true)

              // clear animation refs
              fadeAnimRef.current = {}

              // close modal
              setSettingsVisible(false)
            } catch (error) {
              console.error("Error resetting data:", error)
              Alert.alert("Error", "There was a problem resetting your data.")
            }
          },
        },
      ],
    )
  }

  // button press animations
  const onPressIn = () => {
    Animated.spring(addButtonScale, {
      toValue: 0.9,
      useNativeDriver: true,
    }).start()
  }

  const onPressOut = () => {
    Animated.spring(addButtonScale, {
      toValue: 1,
      friction: 5,
      tension: 40,
      useNativeDriver: true,
    }).start()
  }

  // wait for fonts and auth loading before rendering
  if (!fontsLoaded || authLoading) {
    return null
  }

  // Temporarily bypass authentication for testing
  // TODO: Remove this bypass once Firebase is properly configured
  const skipAuth = true
  
  // show login screen if user is not authenticated (and not bypassing auth)
  if (!skipAuth && !user) {
    return <LoginScreen theme={theme} />
  }

  // handle different screens
  if (currentScreen === 'templateSubmission') {
    return (
      <TemplateSubmissionScreen 
        theme={theme}
        currentSemesters={semesters}
        onBack={() => setCurrentScreen('calculator')}
        onSubmitSuccess={() => {
          setCurrentScreen('calculator')
          Alert.alert("Success", "Template submitted for review!")
        }}
      />
    )
  }

  if (currentScreen === 'admin' && isAdmin) {
    return (
      <AdminScreen 
        theme={theme}
        onBack={() => setCurrentScreen('calculator')}
      />
    )
  }

  // show template selection on first launch
  if (isFirstLaunch && templateSelectionVisible) {
    return (
      <TemplateSelectionModal
        visible={templateSelectionVisible}
        theme={theme}
        handleTemplateSelection={handleTemplateSelection}
      />
    )
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]} onLayout={onLayoutRootView}>
      <StatusBar barStyle={darkMode ? "light-content" : "dark-content"} />

      {/* Header */}
      <Header
        semesters={semesters}
        currentSemesterIndex={currentSemesterIndex}
        theme={theme}
        headerOpacity={headerOpacity}
        semesterScrollX={semesterScrollX}
        addButtonScale={addButtonScale}
        setCurrentSemesterIndex={setCurrentSemesterIndex}
        setEditSemesterIndex={setEditSemesterIndex}
        setEditSemesterName={setEditSemesterName}
        setEditSemesterModal={setEditSemesterModal}
        deleteSemester={deleteSemester}
        setAddSemesterModal={setAddSemesterModal}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
      />

      {/* Main Content */}
      {semesters.length > 0 && semesters[currentSemesterIndex]?.courses.length > 0 ? (
        <ScrollView
          contentContainerStyle={[styles.container, { paddingBottom: 120 }]}
          showsVerticalScrollIndicator={false}
        >
          {semesters[currentSemesterIndex].courses.map((course, index) => (
            <CourseCard
              key={index}
              course={course}
              index={index}
              showMore={showMore}
              theme={theme}
              fadeAnim={getFadeAnim(currentSemesterIndex, index)}
              toggleShowMore={toggleShowMore}
              handleGradeChange={(courseIndex, value) => handleGradeChange(courseIndex, value)}
              editCourse={editCourse}
              deleteCourse={deleteCourse}
            />
          ))}

          {/* Add Course Button */}
          <AddCourseButton
            theme={theme}
            onPress={() => {
              setNewCourseName("")
              setNewCourseCredits("")
              setEditCourseIndex(-1)
              setAddCourseModal(true)
            }}
          />
        </ScrollView>
      ) : (
        <EmptySemester
          semestersLength={semesters.length}
          theme={theme}
          setAddSemesterModal={setAddSemesterModal}
          setNewCourseName={setNewCourseName}
          setNewCourseCredits={setNewCourseCredits}
          setEditCourseIndex={setEditCourseIndex}
          setAddCourseModal={setAddCourseModal}
        />
      )}

      {/* GPA Display */}
      <GPADisplay
        displaySemesterGPA={displaySemesterGPA}
        displayCumulativeGPA={displayCumulativeGPA}
        theme={theme}
        scaleAnim={scaleAnim}
      />

      {/* Settings Button */}
      <TouchableOpacity
        style={[styles.settingsButton, { backgroundColor: theme.card, borderColor: theme.border }]}
        onPress={() => setSettingsVisible(true)}
      >
        <Feather name="settings" size={24} color={theme.text} />
      </TouchableOpacity>

      {/* Modals */}
      <AddSemesterModal
        visible={addSemesterModal}
        theme={theme}
        newSemesterName={newSemesterName}
        setNewSemesterName={setNewSemesterName}
        addSemester={addSemester}
        onClose={() => {
          setNewSemesterName("")
          setAddSemesterModal(false)
        }}
      />

      <EditSemesterModal
        visible={editSemesterModal}
        theme={theme}
        editSemesterName={editSemesterName}
        setEditSemesterName={setEditSemesterName}
        editSemester={editSemester}
        onClose={() => {
          setEditSemesterName("")
          setEditSemesterIndex(-1)
          setEditSemesterModal(false)
        }}
      />

      <AddCourseModal
        visible={addCourseModal}
        theme={theme}
        editCourseIndex={editCourseIndex}
        newCourseName={newCourseName}
        newCourseCredits={newCourseCredits}
        setNewCourseName={setNewCourseName}
        setNewCourseCredits={setNewCourseCredits}
        addOrEditCourse={addOrEditCourse}
        onClose={() => {
          setNewCourseName("")
          setNewCourseCredits("")
          setEditCourseIndex(-1)
          setAddCourseModal(false)
        }}
      />

      <SettingsModal
        visible={settingsVisible}
        theme={theme}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        setInfoModalVisible={setInfoModalVisible}
        resetAllData={resetAllData}
        onClose={() => setSettingsVisible(false)}
        onNavigateToTemplateSubmission={() => setCurrentScreen('templateSubmission')}
        onNavigateToAdmin={isAdmin ? () => setCurrentScreen('admin') : undefined}
        onLogout={logout}
        isAdmin={isAdmin}
      />

      <InfoModal visible={infoModalVisible} theme={theme} onClose={() => setInfoModalVisible(false)} />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    padding: 16,
  },
  settingsButton: {
    position: "absolute",
    top: 60,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
})

export default GPACalculator
