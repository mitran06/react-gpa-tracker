# 🚀 Deployment Guide - GPA Calculator

This guide covers deploying the GPA Calculator app for production use, including APK building, Firebase setup, and distribution.

## 📋 Pre-Deployment Checklist

### ✅ **Code Quality**
- [ ] All TypeScript errors resolved
- [ ] ESLint warnings addressed
- [ ] Credit validation tested (1-100 range)
- [ ] Authentication flows verified
- [ ] Cloud sync functionality tested
- [ ] Error handling reviewed

### ✅ **Firebase Configuration**
- [ ] Production Firebase project created
- [ ] Firestore database configured
- [ ] Authentication enabled (Email/Password)
- [ ] Security rules deployed
- [ ] Admin UID configured
- [ ] Firebase SDK keys secured

### ✅ **App Configuration**
- [ ] App version updated in `app.json`
- [ ] Bundle identifier configured
- [ ] App icon and splash screen set
- [ ] Permissions configured
- [ ] Environment variables set

## 🔥 Firebase Setup

### 1. Create Firebase Project
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize project
firebase init
```

### 2. Configure Authentication
1. Go to Firebase Console → Authentication
2. Enable Email/Password sign-in method
3. Configure email verification settings
4. Set up custom domain (optional)

### 3. Set up Firestore
1. Create Firestore database in production mode
2. Deploy security rules:
```bash
firebase deploy --only firestore:rules
```

### 4. Configure App Settings
1. Update `firebaseConfig.js` with production keys
2. Set admin UID in `src/contexts/AuthContext.tsx`
3. Configure app domain settings

## 📱 APK Building with EAS

### 1. Install EAS CLI
```bash
npm install -g @expo/eas-cli
```

### 2. Login to Expo
```bash
eas login
```

### 3. Configure Build
```bash
eas build:configure
```

### 4. Update `eas.json`
```json
{
  "cli": {
    "version": ">= 3.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "aab"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

### 5. Build APK
```bash
# For testing (APK)
eas build --platform android --profile preview

# For production (AAB for Play Store)
eas build --platform android --profile production
```

## 🏪 Google Play Store Deployment

### 1. Prepare Store Assets
- App icon (512x512 PNG)
- Feature graphic (1024x500 PNG)
- Screenshots (multiple sizes)
- App description and metadata
- Privacy policy and terms of service

### 2. Create Play Console Account
1. Sign up for Google Play Console
2. Pay one-time registration fee ($25)
3. Complete account verification

### 3. Upload App Bundle
1. Create new app in Play Console
2. Upload AAB file from EAS build
3. Configure app details and store listing
4. Set up pricing and distribution

### 4. Review and Publish
1. Complete store listing review
2. Submit for review
3. Monitor review status
4. Publish when approved

## 🔐 Security Considerations

### Firebase Security
```javascript
// Firestore Rules (firestore.rules)
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Template access rules
    match /templates/{templateId} {
      allow read: if request.auth != null && resource.data.isApproved == true;
      allow create: if request.auth != null && request.auth.token.email_verified == true;
      allow update, delete: if request.auth.uid == "ADMIN_UID";
    }
    
    // User data rules
    match /userData/{userId} {
      allow read, write: if request.auth.uid == userId && request.auth.token.email_verified == true;
    }
  }
}
```

### Environment Variables
```bash
# .env file (do not commit to version control)
FIREBASE_API_KEY=your_production_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_production_project_id
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
```

### API Keys Security
- Store API keys in environment variables
- Use different keys for development/production
- Implement Firebase App Check for additional security
- Regularly rotate keys and monitor usage

## 📊 Monitoring & Analytics

### 1. Firebase Analytics
```typescript
// Add to app initialization
import { getAnalytics } from 'firebase/analytics';
const analytics = getAnalytics(app);
```

### 2. Crashlytics (Optional)
```bash
# Install Crashlytics
expo install expo-firebase-analytics
```

### 3. Performance Monitoring
- Monitor app startup time
- Track cloud sync performance
- Monitor authentication success rates
- Track template usage patterns

## 🧪 Testing Strategy

### Pre-Production Testing
1. **Authentication Testing**
   - Email verification flow
   - Login/logout functionality
   - Password reset process
   - Persistent login behavior

2. **Cloud Sync Testing**
   - Cross-device synchronization
   - Offline functionality
   - Conflict resolution
   - Data integrity checks

3. **Template System Testing**
   - Template creation and submission
   - Admin approval workflow
   - Community template access
   - Template data validation

### Test Scenarios
```bash
# Test credit validation
Valid: 1, 3.5, 100
Invalid: 0, 101, "abc", empty

# Test cloud sync
1. Login on Device A, create template
2. Login on Device B, verify template syncs
3. Modify on Device B, verify sync back to A
4. Test offline mode and sync when back online

# Test persistent login
1. Enable persistent login
2. Close app completely
3. Reopen app, verify still logged in
4. Disable persistent login
5. Logout and verify cleared
```

## 🚀 Production Deployment Steps

### 1. Final Code Review
```bash
# Run linting
npm run lint

# Type checking
npx tsc --noEmit

# Test build
eas build --platform android --profile preview --local
```

### 2. Version Management
```json
// app.json
{
  "expo": {
    "version": "2.0.0",
    "android": {
      "versionCode": 20000
    }
  }
}
```

### 3. Build Production APK
```bash
# Production build
eas build --platform android --profile production

# Download and test APK
eas build:list
```

### 4. Deploy Firebase Rules
```bash
firebase deploy --only firestore:rules
firebase deploy --only storage:rules
```

### 5. Submit to Play Store
1. Upload AAB to Play Console
2. Complete store listing
3. Submit for review
4. Monitor review process

## 📈 Post-Deployment

### 1. Monitor App Performance
- Check Firebase Analytics for user engagement
- Monitor crash reports and errors
- Track authentication success rates
- Review cloud sync performance metrics

### 2. User Feedback Collection
- Set up app store review monitoring
- Create feedback collection system
- Monitor social media for mentions
- Respond to user issues promptly

### 3. Continuous Updates
- Plan regular feature updates
- Monitor for security vulnerabilities
- Update dependencies regularly
- Maintain Firebase project settings

## 🆘 Troubleshooting

### Common Build Issues
```bash
# Clear EAS cache
eas build:cancel --all
eas build --clear-cache

# Check build logs
eas build:list --platform android

# Local debugging
npx expo run:android
```

### Firebase Issues
```bash
# Check security rules
firebase firestore:rules:get

# Test rules locally
firebase emulators:start --only firestore

# Deploy specific rules
firebase deploy --only firestore:rules
```

### Play Store Issues
- Ensure AAB file is properly signed
- Check target SDK version requirements
- Verify app permissions are necessary
- Complete all required store listing fields

## 📞 Support & Maintenance

### Documentation
- Keep README.md updated
- Maintain API documentation
- Update deployment guides
- Create user guides and tutorials

### Community Support
- Monitor GitHub issues
- Respond to community questions
- Accept and review pull requests
- Maintain open source standards

### Long-term Maintenance
- Regular dependency updates
- Security patch management
- Performance optimization
- Feature roadmap execution

---

**🎉 Your GPA Calculator is now ready for production!**

This deployment guide ensures a smooth transition from development to production, maintaining security, performance, and user experience standards.

**Made with ♥ by Mitran Gokulnath**
