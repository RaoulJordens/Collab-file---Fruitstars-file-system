export const deploymentGuideContent = `
# Deployment & Integration Guide for FruitstarsFileSystem

This guide provides the steps to connect the React frontend to a live Firebase backend and deploy the entire application.

## Part 1: Setting Up the Firebase Backend

This part assumes you have already used the \`backend_copilot_spec.md\` file to generate your Firebase Cloud Functions and Firestore security rules.

1.  **Create a Firebase Project:**
    *   Go to the [Firebase Console](https://console.firebase.google.com/).
    *   Click "Add project" and follow the on-screen instructions.

2.  **Enable Firebase Services:**
    *   In your new project, navigate to the **Authentication** section. Click "Get started" and enable the **Email/Password** sign-in provider.
    *   Navigate to the **Firestore Database** section. Click "Create database," start in **production mode**, and choose a location.
    *   Navigate to the **Functions** section and click "Get started" to enable Cloud Functions.

3.  **Deploy Your Backend:**
    *   Place the generated backend code (including \`firebase.json\`, \`firestore.rules\`, and the \`functions\` directory) in a new folder on your local machine.
    *   Open a terminal in that folder.
    *   Install the Firebase CLI globally: \`npm install -g firebase-tools\`
    *   Log in to Firebase: \`firebase login\`
    *   Associate your local code with your Firebase project: \`firebase use --add\` and select your project.
    *   Deploy everything: \`firebase deploy\`
    *   Your backend, including security rules and API functions, is now live.

## Part 2: Connecting the Frontend to Firebase

The current frontend uses static data from \`constants.ts\`. You need to replace this with live data from Firestore.

1.  **Add Firebase Configuration to Frontend:**
    *   In the Firebase Console, go to your Project Settings (click the gear icon).
    *   Under "Your apps," click the web icon (\`</>\`) to create a new web app.
    *   Give it a name and click "Register app."
    *   Firebase will provide you with a \`firebaseConfig\` object. Copy this object.
    *   **Crucially, this project uses a simplified setup without a build process, so we cannot use environment variables securely on the client-side for Firebase config. For a real production app, you would use a build tool like Vite or Next.js to manage environment variables. For this project, you will have to paste the config directly.**
    *   *Note: In a real-world scenario, you would use a more secure method, but for this project's structure, direct insertion is the only option.*

2.  **Refactor Frontend State Management:**
    *   The core of this work will be in \`App.tsx\`.
    *   You will need to replace the \`useState\` that holds the \`initialData\` with \`useEffect\` hooks that listen for real-time updates from your Firestore collections.
    *   Use the Firebase Web SDK (\`firebase/firestore\`) and functions like \`onSnapshot\` to subscribe to changes in your \`folders\` and \`files\` collections.
    *   **Example of listening to folders:**
        \`\`\`javascript
        import { collection, onSnapshot } from "firebase/firestore";

        useEffect(() => {
          // Assuming 'db' is your initialized Firestore instance
          const unsubscribe = onSnapshot(collection(db, "folders"), (snapshot) => {
            const foldersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            // Code to process foldersData and update your React state
          });

          return () => unsubscribe(); // Cleanup listener on unmount
        }, []);
        \`\`\`

3.  **Refactor Data Manipulation Functions:**
    *   Functions like \`handleAddFolder\`, \`handleDeleteFile\`, etc., in \`App.tsx\` currently modify the local state directly.
    *   You must refactor these functions to call your deployed **Cloud Functions** instead.
    *   **Example of calling a Cloud Function:**
        \`\`\`javascript
        import { getFunctions, httpsCallable } from "firebase/functions";

        const functions = getFunctions();
        const createFolder = httpsCallable(functions, 'createFolder');

        const handleAddFolder = async (parentId, folderName) => {
          try {
            await createFolder({ parentId, name: folderName });
            // You don't need to update state here!
            // The onSnapshot listener will automatically detect the new folder
            // and update the UI in real-time.
          } catch (error) {
            console.error("Error creating folder:", error);
          }
        };
        \`\`\`

## Part 3: Deploying the Frontend

We will use Firebase Hosting, as it's the most integrated solution.

1.  **Initialize Firebase Hosting:**
    *   In your frontend project's root directory, run \`firebase init hosting\`.
    *   When prompted, select "Use an existing project" and choose the Firebase project you created.
    *   For the public directory, enter \`.\` (a single dot for the current directory), since your \`index.html\` is in the root.
    *   When asked to configure as a single-page app, say **Yes**.
    *   Do **NOT** overwrite the \`index.html\` file if it asks.

2.  **Deploy:**
    *   After initialization, simply run: \`firebase deploy --only hosting\`
    *   Firebase will give you a URL where your live application is hosted.

Your application is now fully deployed, with the frontend and backend connected and working together.
`;
