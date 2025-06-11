# 🔥 FIRESTORE SECURITY RULES SETUP

## Issue: Missing or insufficient permissions

The app is showing Firestore permission errors because security rules haven't been set up yet. Here's how to fix it:

### 1. Go to Firebase Console
1. Visit [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **gpa-calculator-36241**
3. Go to **Firestore Database** in the left sidebar
4. Click on the **Rules** tab

### 2. Replace the Security Rules

Replace the existing rules with these:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Templates collection rules
    match /templates/{templateId} {
      // Anyone authenticated can read approved templates
      allow read: if request.auth != null && resource.data.isApproved == true;
      
      // Anyone authenticated can create templates (they start as unapproved)
      allow create: if request.auth != null 
        && request.auth.uid == request.resource.data.createdBy
        && request.resource.data.isApproved == false;
      
      // Only admin can approve templates (update isApproved field)
      allow update: if request.auth != null 
        && request.auth.uid == "YOUR_ADMIN_UID_HERE"
        && request.resource.data.keys().hasOnly(['isApproved'])
        && request.resource.data.isApproved == true;
      
      // Only admin can delete templates
      allow delete: if request.auth != null 
        && request.auth.uid == "YOUR_ADMIN_UID_HERE";
      
      // Admin can read all templates (including unapproved ones)
      allow read: if request.auth != null 
        && request.auth.uid == "YOUR_ADMIN_UID_HERE";
    }
  }
}
```

### 3. Update Admin UID

**IMPORTANT:** Replace `YOUR_ADMIN_UID_HERE` with your actual Firebase user UID.

#### How to get your Firebase UID:
1. **Method 1:** Check browser console when logged in
   - Open browser dev tools (F12)
   - Look for console logs that show the user object
   - Your UID will be displayed

2. **Method 2:** Temporary code
   Add this temporarily to your app after login:
   ```javascript
   console.log("User UID:", user.uid)
   ```

3. **Method 3:** Firebase Console
   - Go to **Authentication** > **Users** tab
   - Find your user and copy the UID

### 4. Example with Real UID
```javascript
// Replace this line in BOTH places:
&& request.auth.uid == "YOUR_ADMIN_UID_HERE"

// With your actual UID like:
&& request.auth.uid == "abc123xyz456def789ghi012"
```

### 5. Publish Rules
1. Click **Publish** in the Firebase Console
2. Confirm the changes

### 6. Update Code (Optional)
You should also update the admin UID in your app code:

**File:** `src/contexts/AuthContext.tsx` (line 25)
```typescript
// Replace this:
const ADMIN_UID = 'YOUR_ADMIN_UID_HERE'

// With your actual UID:
const ADMIN_UID = 'abc123xyz456def789ghi012'
```

## Security Rules Explanation

### What these rules do:
- ✅ **Read approved templates**: Any authenticated user can read templates where `isApproved = true`
- ✅ **Create templates**: Any authenticated user can submit new templates (automatically set as unapproved)
- ✅ **Admin approval**: Only the admin can approve templates by setting `isApproved = true`
- ✅ **Admin delete**: Only the admin can delete templates
- ✅ **Admin read all**: Admin can read both approved and unapproved templates

### Security features:
- 🔒 **Authentication required**: All operations require login
- 🔒 **User ownership**: Users can only create templates with their own UID
- 🔒 **Admin-only approval**: Only the admin can approve/reject templates
- 🔒 **Controlled updates**: Users can't modify existing templates, only admin can approve them

After setting up these rules, the Firestore permission errors should be resolved! 🎉
