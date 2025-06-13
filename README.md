# 🎓 GPA Calculator - React Native + Firebase

A comprehensive, cloud-synced GPA calculator built with React Native, Expo, and Firebase. Features persistent login, template sharing, and real-time data synchronization across devices.

## ✨ Features

### 🔐 **Authentication & Security**
- Email/password authentication with Firebase Auth
- Email verification required for all users
- Persistent login (stay logged in unless manually logged out)
- Secure user session management
- Admin panel with restricted access

### 📊 **GPA Calculation**
- Supports multiple semesters and courses
- Real-time GPA calculation (semester and cumulative)
- Credit validation (1-100 credits per course)
- Grade scale: A+, A, A-, B+, B, B-, C+, C, C-, D, F
- Animated GPA value transitions

### 📱 **Template System**
- Choose from community-approved templates
- Submit custom templates for approval
- Default templates for common academic programs
- Template validation and admin approval system
- Cloud-synced template preferences

### ☁️ **Cloud Sync & Persistence**
- Real-time cloud synchronization across devices
- Local data persistence with AsyncStorage
- Automatic conflict resolution (cloud vs local data)
- Template and user data backup
- Offline-first design with cloud sync when available

### 🎨 **User Experience**
- Dark/Light mode support
- Smooth animations and transitions
- Responsive design for different screen sizes
- Intuitive course and semester management
- Real-time error handling and feedback

### 👨‍💼 **Admin Features**
- Template approval/rejection system
- User management capabilities
- Analytics and statistics dashboard
- Bulk template operations

## 🚀 Tech Stack

- **Frontend**: React Native with Expo Managed Workflow
- **Backend**: Firebase (Auth, Firestore)
- **State Management**: React Hooks & Context API
- **Storage**: AsyncStorage + Firestore
- **Authentication**: Firebase Auth Web SDK
- **Database**: Cloud Firestore
- **Styling**: React Native StyleSheet
- **Icons**: Expo Vector Icons (Feather)
- **Fonts**: Inter (Google Fonts)

## 📦 Installation

### Prerequisites
- Node.js (14 or higher)
- npm or pnpm
- Expo CLI
- Android Studio (for Android development)

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/gpa-calculator.git
   cd gpa-calculator
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   # or
   npm install
   ```

3. **Configure Firebase**
   - Create a new Firebase project
   - Enable Authentication (Email/Password)
   - Create a Firestore database
   - Copy your Firebase config to `firebaseConfig.js`
   - Deploy the Firestore security rules from `firestore.rules`

4. **Set up Admin User**
   - Update the `ADMIN_UID` in `src/contexts/AuthContext.tsx`
   - Replace with your Firebase user UID

5. **Run the app**
   ```bash
   pnpm start
   # or
   npm start
   ```

## 🏗️ Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── modals/          # Modal components
│   └── ui/              # Base UI components
├── screens/             # Main app screens
├── hooks/               # Custom React hooks
├── services/            # API and business logic
├── contexts/            # React context providers
├── constants/           # App constants and configs
├── types/               # TypeScript type definitions
└── utils/               # Utility functions
```

### Key Components

- **GPACalculator**: Main calculator screen with semester/course management
- **AuthContext**: Authentication state management
- **UserDataService**: Cloud sync and data persistence
- **TemplateService**: Template submission and management
- **AdminScreen**: Admin panel for template approval

## 🔒 Security Features

### Firestore Security Rules
```javascript
// Users can only access their own data
match /userData/{userId} {
  allow read, write: if request.auth != null 
    && request.auth.uid == userId
    && request.auth.token.email_verified == true;
}

// Template submissions require email verification
match /templates/{templateId} {
  allow create: if request.auth != null 
    && request.auth.token.email_verified == true;
}
```

### Data Validation
- Credit values: 1-100 range validation
- Template names: Length and character validation
- Email verification required for all operations
- Input sanitization and error handling

## 📊 Data Models

### User Data
```typescript
interface UserCloudData {
  uid: string
  activeTemplate: {
    name: string
    isDefault: boolean
    isCustom: boolean
    templateId?: string
    semesters: Semester[]
  }
  settings: {
    darkMode: boolean
    persistentLogin: boolean
  }
  lastUpdated: Date
  createdAt: Date
}
```

### Template
```typescript
interface Template {
  id?: string
  name: string
  description: string
  structure: {
    semesters: Semester[]
  }
  createdBy: string
  isApproved: boolean
  createdAt: Date
}
```

## 🚀 Deployment

### Building APK
```bash
# Configure EAS
eas login
eas build:configure

# Build for Android
eas build --platform android
```

### Firebase Deployment
```bash
# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Firebase functions (if any)
firebase deploy --only functions
```

## 🧪 Testing

The app includes comprehensive testing for:
- Credit validation (1-100 range)
- Authentication flows
- Cloud sync functionality
- Template submission and approval
- Data persistence and recovery

### Test Scenarios
- **Valid Credits**: 1, 3.5, 100
- **Invalid Credits**: 0, 101, "abc", empty
- **Cloud Sync**: Login from multiple devices
- **Offline Mode**: Ensure data persists when offline

## 🔧 Configuration

### Environment Variables
Create a `.env` file with:
```
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
```

### Admin Configuration
Update the admin UID in `src/contexts/AuthContext.tsx`:
```typescript
const ADMIN_UID = 'your_firebase_uid_here'
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Use functional components with hooks
- Maintain consistent error handling
- Write descriptive commit messages
- Test cloud sync functionality

## 📱 Platform Support

- **Android**: Full support (primary target)
- **iOS**: Compatible but not primary focus
- **Web**: Limited support through Expo Web

## 🆘 Support

For support and questions:
- Check existing GitHub issues
- Create a new issue with detailed description
- Include device info and error logs

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Mitran Gokulnath**
- LinkedIn: [mitran-gokulnath](https://linkedin.com/in/mitran-gokulnath)
- GitHub: [mitran06](https://github.com/mitran06)

## 🙏 Acknowledgments

- Firebase team for excellent documentation
- React Native community for inspiration
- Expo team for the amazing development experience
- Inter font family for beautiful typography

---

**Made with ♥ by Mitran**
