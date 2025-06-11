# 🔧 FIRESTORE RULES FIX - Template Submission Error

## ❌ Current Issue
You're getting "Missing or insufficient permissions" when submitting templates because the Firestore rule is checking the wrong field.

## 🔍 Root Cause
Your app stores `createdBy` as the **email username** (e.g., "john" from "john@email.com"), but the Firestore rule is checking if the **UID** matches `createdBy`. These are completely different values!

## ✅ Fixed Firestore Rules

Replace your current rules with these **CORRECTED** rules in Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Templates collection rules
    match /templates/{templateId} {
      // Anyone authenticated can read approved templates
      allow read: if request.auth != null && resource.data.isApproved == true;
      
      // Anyone authenticated can create templates (they start as unapproved)
      // Fixed: Check if user is authenticated only, since createdBy is email username not UID
      allow create: if request.auth != null 
        && request.resource.data.isApproved == false;
      
      // Only admin can approve templates (update isApproved field)
      allow update: if request.auth != null 
        && request.auth.uid == "wJN9veAIWGhLR86PFwSXiEkUnr22"
        && request.resource.data.keys().hasOnly(['isApproved'])
        && request.resource.data.isApproved == true;
      
      // Only admin can delete templates
      allow delete: if request.auth != null 
        && request.auth.uid == "wJN9veAIWGhLR86PFwSXiEkUnr22";
      
      // Admin can read all templates (including unapproved ones)
      allow read: if request.auth != null 
        && request.auth.uid == "wJN9veAIWGhLR86PFwSXiEkUnr22";
    }
  }
}
```

## 🔧 Alternative: More Secure Version

If you want better security that validates the user creating the template, use this version instead:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Templates collection rules
    match /templates/{templateId} {
      // Anyone authenticated can read approved templates
      allow read: if request.auth != null && resource.data.isApproved == true;
      
      // Anyone authenticated can create templates (they start as unapproved)
      // Secure: Check that createdBy matches the authenticated user's email username
      allow create: if request.auth != null 
        && request.resource.data.isApproved == false
        && request.resource.data.createdBy == request.auth.token.email.split('@')[0];
      
      // Only admin can approve templates (update isApproved field)
      allow update: if request.auth != null 
        && request.auth.uid == "wJN9veAIWGhLR86PFwSXiEkUnr22"
        && request.resource.data.keys().hasOnly(['isApproved'])
        && request.resource.data.isApproved == true;
      
      // Only admin can delete templates
      allow delete: if request.auth != null 
        && request.auth.uid == "wJN9veAIWGhLR86PFwSXiEkUnr22";
      
      // Admin can read all templates (including unapproved ones)
      allow read: if request.auth != null 
        && request.auth.uid == "wJN9veAIWGhLR86PFwSXiEkUnr22";
    }
  }
}
```

## 📋 Steps to Fix:

1. **Go to Firebase Console** → Firestore Database → Rules
2. **Replace your current rules** with one of the versions above
3. **Click "Publish"** to save
4. **Test template submission** - should work now!

## 🎯 What Changed:

### ❌ **Before (Broken)**:
```javascript
allow create: if request.auth != null 
  && request.auth.uid == request.resource.data.createdBy  // UID != email username
```

### ✅ **After (Fixed)**:
```javascript
allow create: if request.auth != null 
  && request.resource.data.isApproved == false;  // Just check auth + approval status
```

**OR for more security:**
```javascript
allow create: if request.auth != null 
  && request.resource.data.createdBy == request.auth.token.email.split('@')[0];  // Match email username
```

Use the **first fixed version** for simplicity, or the **second version** for better security validation.

Your template submission should work immediately after updating these rules! 🎉
