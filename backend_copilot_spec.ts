export const backendSpecContent = `
# Firebase Backend Specification for FruitstarsFileSystem

This document provides a comprehensive specification for building the backend for the "FruitstarsFileSystem" application using Firebase. This prompt is designed to be used with an AI code generation tool like GitHub Copilot.

## 1. Project Setup & Technologies

- **Platform:** Firebase
- **Core Services:**
    - **Firebase Authentication:** For user management (sign-up, login). Start with Email/Password authentication.
    - **Cloud Firestore:** As the NoSQL database for storing all application data (users, folders, files).
    - **Cloud Functions for Firebase:** To house our backend logic (API endpoints). Use TypeScript for the functions.
    - **Firebase Security Rules:** To protect the Firestore database.

## 2. Firestore Data Models

Create the following data structure in Firestore.

### Collection: \`users\`
- **Path:** \`/users/{userId}\`
- **Purpose:** Stores basic user information. The \`userId\` should match the UID from Firebase Authentication.
- **Schema:**
    \`\`\`json
    {
      "uid": "string",
      "email": "string",
      "displayName": "string",
      "createdAt": "Timestamp"
    }
    \`\`\`

### Collection: \`folders\`
- **Path:** \`/folders/{folderId}\`
- **Purpose:** Stores all folder information. A top-level collection is used to allow for flexible querying. Folders will be linked via a \`parentId\` field to create the hierarchy.
- **Schema:**
    \`\`\`json
    {
      "id": "string", // Document ID
      "name": "string",
      "parentId": "string | null", // \`null\` for root-level folders
      "ownerId": "string", // The userId of the creator
      "collaborators": {
        // Map of userIds to their roles
        // "{userId}": "owner" | "editor" | "viewer"
      },
      "createdAt": "Timestamp",
      // Optional fields for shipment dossiers
      "clientId": "string | null",
      "supplierId": "string | null",
      "invoiceNumber": "string | null"
      // ... and other dossier-specific fields
    }
    \`\`\`

### Collection: \`files\`
- **Path:** \`/files/{fileId}\`
- **Purpose:** Stores metadata for all files.
- **Schema:**
    \`\`\`json
    {
      "id": "string", // Document ID
      "name": "string",
      "folderId": "string", // The ID of the parent folder
      "ownerId": "string", // The userId of the uploader
      "storagePath": "string", // Path to the file in Cloud Storage
      "size": "number", // in bytes
      "type": "string", // e.g., 'application/pdf'
      "labels": ["array of label objects"],
      "createdAt": "Timestamp",
      "expirationDate": "Timestamp | null"
    }
    \`\`\`

## 3. Cloud Functions (API Endpoints)

Create the following HTTP-callable Cloud Functions. Use TypeScript. All functions should be authenticated and only perform actions if the user has the correct permissions.

- **\`getFolderTree()\`**:
    - **Trigger:** HTTP Request
    - **Action:** Fetches all folders and files the currently authenticated user has access to and returns them structured in a nested JSON object that the frontend can render.

- **\`createFolder(name, parentId)\`**:
    - **Trigger:** HTTP Request
    - **Action:** Creates a new folder document in Firestore. The calling user is set as the \`ownerId\` and added to the \`collaborators\` map.

- **\`updateFolder(folderId, updates)\`**:
    - **Trigger:** HTTP Request
    - **Action:** Updates a folder's details. Only users with "owner" or "editor" roles for that folder should be able to do this.

- **\`deleteFolder(folderId)\`**:
    - **Trigger:** HTTP Request
    - **Action:** Deletes a folder and all its contents (subfolders and files). This should be a recursive deletion. Only "owners" can perform this action.

- **\`uploadFile(folderId, fileMetadata)\`**:
    - **Trigger:** HTTP Request
    - **Action:** This function should generate a signed URL for the client to upload a file directly to Cloud Storage. After the client confirms the upload is complete, this function saves the file's metadata to the \`files\` collection in Firestore.

- **\`deleteFile(fileId)\`**:
    - **Trigger:** HTTP Request
    - **Action:** Deletes a file's metadata from Firestore and the corresponding file from Cloud Storage. Only "owners" or "editors" of the parent folder can do this.

- **\`moveFile(fileId, targetFolderId)\`**:
    - **Trigger:** HTTP Request
    - **Action:** Updates the \`folderId\` field of a file document. The user must have editor permissions in both the source and target folders.

## 4. Firestore Security Rules

Implement robust security rules to protect the data.

- **\`users\` Collection:**
    - A user can only read or write their own user document (\`request.auth.uid == userId\`).

- **\`folders\` Collection:**
    - **Read:** A user can read a folder document if their \`uid\` is present as a key in the folder's \`collaborators\` map.
    - **Create:** Any authenticated user can create a folder.
    - **Update:** A user can update a folder if their role in the \`collaborators\` map is \`editor\` or \`owner\`.
    - **Delete:** A user can delete a folder only if their role is \`owner\`.

- **\`files\` Collection:**
    - **Read/Write:** To determine access for a file, the rules must look up the file's parent folder (\`/folders/{file.folderId}\`). A user can read or write a file if they have the appropriate permissions (read for viewer, write for editor/owner) on the parent folder. This requires using \`get()\` in the security rules.
    - **Delete:** A user can delete a file if they are an \`editor\` or \`owner\` of the parent folder.

This specification provides a complete roadmap. Please generate the necessary Firebase project files, including \`functions/src/index.ts\` for the Cloud Functions and \`firestore.rules\` for the security rules.
`;
