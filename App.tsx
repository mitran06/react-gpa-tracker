"use client"
import { useEffect } from "react"
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_700Bold } from "@expo-google-fonts/inter"
import * as SplashScreen from "expo-splash-screen"
import GPACalculator from "./src/screens/GPACalculator"
import { AuthProvider } from "./src/contexts/AuthContext"
import { ErrorBoundary } from "./src/components/ErrorBoundary"

// prevent the splash screen from hiding automatically
SplashScreen.preventAutoHideAsync()

const App = () => {
  // load the inter fonts
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_700Bold,
  })

  useEffect(() => {
    if (fontsLoaded) {
      // small delay to ensure everything is ready before hiding splash
      setTimeout(() => {
        SplashScreen.hideAsync()
      }, 100)
    }
  }, [fontsLoaded])

  if (!fontsLoaded) {
    return null
  }

  return (
    <ErrorBoundary>
      <AuthProvider>
        <GPACalculator />
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App
