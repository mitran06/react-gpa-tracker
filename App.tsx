"use client"
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_700Bold } from "@expo-google-fonts/inter"
import GPACalculator from "./src/screens/GPACalculator"

const App = () => {
  // load fonts first
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_700Bold,
  })

  if (!fontsLoaded) {
    return null
  }

  return <GPACalculator />
}

export default App
