# 🔧 TEMPORARY FIRESTORE RULES - FOR INITIAL SETUP

## Problem: Can't login to get UID because rules are blocking access

This is a temporary solution to allow you to register and login first, then we'll secure the rules properly.

## Step 1: Set Temporary Permissive Rules

Go to Firebase Console → Firestore Database → Rules and replace with these **TEMPORARY** rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // TEMPORARY: Allow all authenticated users to read/write templates
    // We'll make this secure after you get your UID
    match /templates/{templateId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Step 2: Test Authentication

1. **Publish the temporary rules** in Firebase Console
2. **Reload your app** (scan QR code again)
3. **Try to access the login screen** - it should now appear
4. **Register a new account** with your email/password
5. **Login successfully**

## Step 3: Get Your UID

After successful login, your UID will be logged in the console. Look for console messages or add this to see it clearly.

## Step 4: Update to Secure Rules

Once you have your UID, replace the temporary rules with the secure ones from `FIRESTORE_SECURITY_RULES.md`, using your actual UID.

## Why This Works

- ✅ **Allows authentication** without strict rules
- ✅ **Lets you register/login** to get your UID  
- ✅ **Templates work temporarily** for testing
- ⚠️ **Not secure** - only for initial setup

## Next Steps

1. Use these temporary rules now
2. Register and login to get your UID
3. Switch back to secure rules with your real UID
4. Test the full admin functionality

This temporary approach will unblock you! 🚀
