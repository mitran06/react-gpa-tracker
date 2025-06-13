import { View, Text, TouchableOpacity, Modal, Switch, StyleSheet, Linking, ScrollView } from "react-native"
import { Feather } from "@expo/vector-icons"
import type { Theme } from "../../types"

interface SettingsModalProps {
  visible: boolean
  theme: Theme
  darkMode: boolean
  setDarkMode: (value: boolean) => void
  setInfoModalVisible: (visible: boolean) => void
  resetAllData: () => void
  onClose: () => void
  onNavigateToTemplateSubmission: () => void
  onNavigateToAdmin?: () => void
  onLogout: () => void
  isAdmin: boolean
}

const SettingsModal = ({
  visible,
  theme,
  darkMode,
  setDarkMode,
  setInfoModalVisible,  resetAllData,
  onClose,
  onNavigateToTemplateSubmission,
  onNavigateToAdmin,
  onLogout,
  isAdmin,
}: SettingsModalProps) => {
  return (
    <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity 
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity 
          style={[styles.settingsContent, { backgroundColor: theme.card }]}
          activeOpacity={1}
          onPress={() => {}}
        >
          <View style={styles.settingsHeader}>            <TouchableOpacity style={styles.backButton} onPress={onClose}>
              <Feather name="arrow-left" size={24} color={theme.text} />
            </TouchableOpacity>
            <Text style={[styles.settingsTitle, { color: theme.text, fontFamily: "Inter_700Bold" }]}>Settings</Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView style={styles.settingsSection} showsVerticalScrollIndicator={false}>
            <View style={styles.settingItem}>
              <View style={styles.settingLabelContainer}>
                <Feather name={darkMode ? "moon" : "sun"} size={20} color={theme.text} />
                <Text style={[styles.settingLabel, { color: theme.text, fontFamily: "Inter_400Regular" }]}>
                  {darkMode ? "Dark Mode" : "Light Mode"}
                </Text>
              </View>
              <Switch
                value={darkMode}
                onValueChange={(value) => setDarkMode(value)}
                trackColor={{ false: "#767577", true: "#6200EE" }}
                thumbColor="#f4f3f4"
              />
            </View>            <TouchableOpacity style={styles.settingItem} onPress={() => {
              onClose()
              onNavigateToTemplateSubmission()
            }}>
              <View style={styles.settingLabelContainer}>
                <Feather name="upload" size={20} color={theme.text} />
                <Text style={[styles.settingLabel, { color: theme.text, fontFamily: "Inter_400Regular" }]}>
                  Submit Template
                </Text>
              </View>
              <Feather name="chevron-right" size={20} color={theme.subtext} />
            </TouchableOpacity>

            {isAdmin && onNavigateToAdmin && (
              <TouchableOpacity style={styles.settingItem} onPress={() => {
                onClose()
                onNavigateToAdmin()
              }}>
                <View style={styles.settingLabelContainer}>
                  <Feather name="shield" size={20} color={theme.text} />
                  <Text style={[styles.settingLabel, { color: theme.text, fontFamily: "Inter_400Regular" }]}>
                    Admin Panel
                  </Text>
                </View>
                <Feather name="chevron-right" size={20} color={theme.subtext} />
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.settingItem} onPress={() => setInfoModalVisible(true)}>
              <View style={styles.settingLabelContainer}>
                <Feather name="info" size={20} color={theme.text} />
                <Text style={[styles.settingLabel, { color: theme.text, fontFamily: "Inter_400Regular" }]}>
                  About GPA Calculation
                </Text>
              </View>
              <Feather name="chevron-right" size={20} color={theme.subtext} />
            </TouchableOpacity>

            <TouchableOpacity style={[styles.logoutButton, { backgroundColor: theme.primary }]} onPress={() => {
              onClose()
              onLogout()
            }}>
              <Feather name="log-out" size={20} color="#ffffff" />
              <Text style={[styles.logoutButtonText, { color: "#ffffff", fontFamily: "Inter_500Medium" }]}>
                Logout
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.resetButton, { backgroundColor: theme.danger }]} onPress={resetAllData}>
              <Feather name="refresh-cw" size={20} color="#ffffff" />
              <Text style={[styles.resetButtonText, { color: "#ffffff", fontFamily: "Inter_500Medium" }]}>
                Choose a template
              </Text>
            </TouchableOpacity>

            <View style={styles.aboutSection}>
              <Text style={[styles.aboutTitle, { color: theme.text, fontFamily: "Inter_500Medium" }]}>About</Text>
              <Text style={[styles.aboutText, { color: theme.subtext, fontFamily: "Inter_400Regular" }]}>
                GPA Calculator v2.0
              </Text>
              <Text style={[styles.aboutText, { color: theme.subtext, fontFamily: "Inter_400Regular" }]}>
                Developed by Mitran
              </Text>
              
              {/* Social Links */}
              <View style={styles.socialLinks}>
                <TouchableOpacity 
                  style={[styles.socialButton, { backgroundColor: theme.primary }]}
                  onPress={() => {
                    Linking.openURL('https://linkedin.com/in/mitran-gokulnath')
                  }}
                >
                  <Feather name="linkedin" size={20} color="#ffffff" />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.socialButton, { backgroundColor: theme.text }]}
                  onPress={() => {
                    Linking.openURL('https://github.com/mitran06')
                  }}
                >                  <Feather name="github" size={20} color={theme.background} />
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  settingsContent: {
    width: "90%",
    height: "80%",
    borderRadius: 12,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    padding: 20,
  },
  settingsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  backButton: {
    padding: 4,
  },  settingsTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  settingsSection: {
    flex: 1,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,    borderBottomColor: "rgba(150, 150, 150, 0.2)",
  },
  settingLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  settingTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    marginLeft: 12,
  },
  settingDescription: {
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
  resetButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 8,
    marginTop: 20,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 8,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 8,
    marginTop: 20,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: "500",    marginLeft: 8,
  },
  aboutSection: {
    marginTop: 40,
    alignItems: "center",
  },
  aboutTitle: {
    fontSize: 18,
    fontWeight: "500",
    marginBottom: 8,
  },  aboutText: {
    fontSize: 14,
    marginBottom: 4,
  },
  socialLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    gap: 16,
  },
  socialButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
})

export default SettingsModal
