I'm in the middle of developing a React Native + Firebase GPA calculator app using Expo Managed Workflow. The app is built for Android and will be compiled into an APK. Currently, the app is entirely client-side.


Core requirements:

1. **Authentication**
   - Use Firebase **Email/Password login** (no phone auth)
   - Use the **Firebase Web SDK** (`firebase/auth`) to authenticate users

2. **Template System**
   - Users can:
     - Choose from existing **approved user-submitted templates**, fetched from Firestore (a default one preloaded in app right now)
     - Choose an empty template to create their own
     - **Submit new templates** to Firestore (marked `isApproved: false`)
   - A template has:
     - `name`: string (e.g. "ECE Sem 5")
     - `structure`: this includes semester details, subjects, and credits
     - `description`: string
     - `createdBy`: user email without the domain
     - `isApproved`: boolean
     - `createdAt`: timestamp

3. **Firestore Integration**
   - Use `firebase/firestore` to:
     - Submit templates
     - Fetch templates where `isApproved == true`
     - Store the UID of the creator (`createdBy`)
   - Fetch user-submitted templates from Firestore and display them

4. **Manual Approval System**
   - Only the admin (identified by hardcoded UID) can:
     - View templates where `isApproved == false`
     - Approve (set `isApproved = true`)
     - Reject/delete templates

5. **Screens to Implement**
   - Login screen (email/password)
   - Home screen with template selector (default, approved)
   - Template submission form
   - Admin screen to review and approve/reject submissions

6. **Tools & Constraints**
   - Use **Firebase Web SDK** (`firebase`) only — no native SDKs like `@react-native-firebase`
   - Keep the code Expo-compatible (don’t eject)
   - Use React hooks and functional components
   - Add loading states and error handling
   - Persist login session and handle logout

7. **Security Rules**
   - Use `request.auth.uid` to restrict:
     - Template creation to logged-in users
     - Approval actions to a single admin UID

Do not use push notifications, phone auth, or analytics for now. Your main job is to help code this application structure and ensure Expo and Firebase work smoothly together.
