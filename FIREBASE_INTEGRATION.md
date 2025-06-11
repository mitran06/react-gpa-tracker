# Firebase Integration Setup Guide

## Completed Implementation

### 1. Firebase Configuration ✅
- Updated `firebaseConfig.js` to export auth and Firestore instances
- Configured for Firebase Web SDK compatibility with Expo

### 2. Authentication System ✅
- **AuthContext** (`src/contexts/AuthContext.tsx`):
  - Email/password authentication using Firebase Auth
  - Persistent login sessions
  - Admin role detection based on hardcoded UID
  - Login, register, logout functions

- **LoginScreen** (`src/screens/LoginScreen.tsx`):
  - Clean email/password login form
  - Error handling and loading states
  - Consistent with app design language

### 3. Template System ✅
- **Template Types** (`src/types/index.ts`):
  - Template, TemplateStructure, User interfaces
  - Firebase-compatible type definitions

- **TemplateService** (`src/services/TemplateService.ts`):
  - Submit new templates to Firestore
  - Fetch approved templates for users
  - Fetch pending templates for admin
  - Approve/reject template functionality

- **TemplateSubmissionScreen** (`src/screens/TemplateSubmissionScreen.tsx`):
  - Form to submit new templates
  - Template validation and preview
  - Integration with current semester structure

- **AdminScreen** (`src/screens/AdminScreen.tsx`):
  - View pending templates
  - Approve/reject functionality
  - Template detail modal

### 4. UI Integration ✅
- **Enhanced TemplateSelectionModal**:
  - Displays Firebase community templates
  - Fallback to default templates
  - Loading states and error handling

- **Updated SettingsModal**:
  - Navigation to template submission
  - Admin panel access (for admins only)
  - Logout functionality

- **Main GPACalculator Integration**:
  - Authentication flow
  - Screen navigation system
  - Firebase template support

### 5. App Structure ✅
- **App.tsx**: Wrapped with AuthProvider
- **Authentication-first flow**: Login required before accessing calculator
- **Role-based access**: Admin features only visible to admin users

## Required Configuration

### 1. Admin UID Setup ⚠️
**Location**: `src/contexts/AuthContext.tsx`
```typescript
// Replace this with your actual admin Firebase UID
const ADMIN_UID = 'YOUR_ADMIN_UID_HERE'
```

**To get your admin UID:**
1. Create an admin account in the app
2. Check Firebase Console > Authentication > Users
3. Copy the UID of your admin account
4. Replace the placeholder in AuthContext.tsx

### 2. Firestore Security Rules ⚠️
**Required rules** (add to Firebase Console > Firestore > Rules):
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read approved templates
    match /templates/{templateId} {
      allow read: if request.auth != null && resource.data.isApproved == true;
      allow create: if request.auth != null && 
                   request.auth.uid == resource.data.createdBy &&
                   resource.data.isApproved == false;
    }
    
    // Admin-only access to pending templates and approval actions
    match /templates/{templateId} {
      allow read, update, delete: if request.auth != null && 
                                  request.auth.uid == 'YOUR_ADMIN_UID_HERE';
    }
  }
}
```

### 3. Firebase Project Setup ⚠️
**Verify in Firebase Console:**
1. **Authentication** > Sign-in method > Email/Password enabled
2. **Firestore Database** > Created with proper rules
3. **Project Settings** > General > Web API Key configured in firebaseConfig.js

## Testing Checklist

### Authentication Flow
- [ ] User can register with email/password
- [ ] User can login with email/password  
- [ ] Login persists across app restarts
- [ ] Logout works correctly
- [ ] Non-authenticated users see login screen

### Template System
- [ ] Users can submit new templates
- [ ] Templates marked as `isApproved: false` initially
- [ ] Admin can view pending templates
- [ ] Admin can approve/reject templates
- [ ] Approved templates appear in template selection

### Admin Features
- [ ] Admin panel only visible to admin users
- [ ] Non-admin users cannot access admin features
- [ ] Template approval/rejection works correctly

### Security
- [ ] Firestore rules prevent unauthorized access
- [ ] Template submission requires authentication
- [ ] Admin operations require admin UID

## Database Structure

### Templates Collection (`/templates/{templateId}`)
```typescript
{
  id: string,              // Auto-generated document ID
  name: string,            // e.g. "ECE Semester 5"
  description: string,     // Template description
  structure: {
    semesters: [           // Array of semester objects
      {
        name: string,      // e.g. "Semester 1"
        courses: [         // Array of course objects
          {
            name: string,  // e.g. "Mathematics"
            credits: number,
            grade: string  // Initially empty
          }
        ]
      }
    ]
  },
  createdBy: string,       // Firebase UID of creator
  isApproved: boolean,     // false for new submissions
  createdAt: Timestamp     // Auto-generated
}
```

## Next Steps

1. **Configure Admin UID** in AuthContext.tsx
2. **Set up Firestore Security Rules** in Firebase Console
3. **Test authentication flow** with real users
4. **Test template submission** and approval workflow
5. **Verify security rules** are working correctly

## Troubleshooting

### Common Issues
- **"Permission denied" errors**: Check Firestore security rules
- **Admin features not showing**: Verify admin UID matches exactly
- **Templates not loading**: Ensure user is authenticated and templates are approved
- **Firebase connection issues**: Verify firebaseConfig.js configuration

### Debug Tips
- Check Firebase Console > Authentication for user accounts
- Check Firebase Console > Firestore for template documents
- Use browser dev tools to inspect network requests
- Check app logs for authentication state changes
