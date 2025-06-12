# 🔧 ADMIN UID UPDATE INSTRUCTIONS

## If Your UID Changed:

1. **Check console logs** when you login
2. **Look for**: `🔑 Current User Info: { uid: "YOUR_NEW_UID", ... }`
3. **Copy the new UID**
4. **Update** `src/contexts/AuthContext.tsx` line 30:

```typescript
// Replace this line:
const ADMIN_UID = 'wJN9veAIWGhLR86PFwSXiEkUnr22'

// With your new UID:
const ADMIN_UID = 'YOUR_NEW_UID_HERE'
```

5. **Update** `firestore.rules` with the new UID:

```javascript
// Replace in Firestore rules:
&& request.auth.uid == "wJN9veAIWGhLR86PFwSXiEkUnr22"

// With:
&& request.auth.uid == "YOUR_NEW_UID_HERE"
```

6. **Upload updated rules** to Firebase Console

## Quick Test:
- Login → Check console for UID
- Go to Admin screen → Should show `isAdmin: true`
- Try approve/reject → Should work now

The code now bypasses email verification for admin accounts!
