export const appwriteConfig = {
  endpointurl: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!,
  projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT!,
  databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE!,
  userCollectionId: process.env.NEXT_PUBLIC_APPWRITE_USER_COLLECTION!,
  fileCollectionId: process.env.NEXT_PUBLIC_APPWRITE_FILE_COLLECTION!,
  bucketId: process.env.NEXT_PUBLIC_APPWRITE_BUCKET!,
  secrectKey: process.env.NEXT_APPWRITE_KEY!,
};
