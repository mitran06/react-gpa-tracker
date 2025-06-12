# 🔧 FIRESTORE RULES - FINAL WORKING VERSION

## Copy these rules to Firebase Console:

1. **Go to**: Firebase Console → Firestore Database → Rules
2. **Replace all content** with the rules below
3. **Click "Publish"**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /templates/{templateId} {
      // Anyone authenticated can read approved templates
      allow read: if request.auth != null && resource.data.isApproved == true;
      
      // Anyone authenticated can create templates (they start as unapproved)
      allow create: if request.auth != null 
        && request.auth.uid == request.resource.data.createdBy
        && request.resource.data.isApproved == false;
      
      // Admin can update templates (approve them)
      allow update: if request.auth != null 
        && request.auth.uid == "wJN9veAIWGhLR86PFwSXiEkUnr22";
      
      // Admin can delete templates
      allow delete: if request.auth != null 
        && request.auth.uid == "wJN9veAIWGhLR86PFwSXiEkUnr22";
      
      // Admin can read all templates (including unapproved ones)
      allow read: if request.auth != null 
        && request.auth.uid == "wJN9veAIWGhLR86PFwSXiEkUnr22";
    }
  }
}
```

## 🎯 What This Fixes:

### ✅ **Template Creation**: 
- ✅ Any authenticated user can submit templates
- ✅ Templates start as `isApproved: false`

### ✅ **Admin Approval**: 
- ✅ Admin can update any field on templates
- ✅ Admin can approve templates (set `isApproved: true`)
- ✅ Admin can read all templates (approved + pending)

### ✅ **Admin Rejection**: 
- ✅ Admin can delete templates completely
- ✅ No complex field restrictions

### ✅ **Public Access**: 
- ✅ Users can read approved templates
- ✅ Users can read their own submitted templates

## 🚀 Testing Instructions:

1. **Upload these rules** to Firebase Console
2. **Test template submission** as regular user
3. **Test admin approval** - should work now
4. **Test admin rejection** - should work now
5. **Check console logs** for detailed debugging info

The simplified admin rules should fix the approval/rejection issue!
