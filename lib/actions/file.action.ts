"use server";

import { createAdminClient } from "../appwrite";
import { InputFile } from "node-appwrite/file";
import { appwriteConfig } from "../appwrite/config";
import { ID, Models, Query } from "node-appwrite";
import { constructFileUrl, getFileType, parseStringify } from "../utils";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "./user.actions";

const handleError = (error: unknown, message: string) => {
  console.error(message, error);
  throw new Error(message);
};

// export const uploadFile = async ({
//   file,
//   ownerId,
//   accountId,
//   path,
// }: UploadFileProps) => {
//   const { storage, databases } = await createAdminClient();
//   try {
//     const inputFile = InputFile.fromBuffer(file, file.name);
//     const bucketFile = await storage.createFile(
//       appwriteConfig.bucketId,
//       ID.unique(),
//       inputFile
//     );
//     const fileDocument = {
//       type: getFileType(bucketFile.name).type,
//       name: bucketFile.name,
//       url: constructFileUrl(bucketFile.$id),
//       extension: getFileType(bucketFile.name).extension,
//       size: bucketFile.sizeOriginal,
//       owner: ownerId,
//       accountId,
//       users: [],
//       bucketFileId: bucketFile.$id,
//     };
//     const newFile = await databases
//       .createDocument(
//         appwriteConfig.databaseId,
//         appwriteConfig.fileCollectionId,
//         ID.unique(),
//         fileDocument
//       )
//       .catch(async (error: unknown) => {
//         await storage.deleteFile(appwriteConfig.bucketId, bucketFile.$id);
//         handleError(error, "Failed to create file document");
//       });
//     revalidatePath(path);
//     return parseStringify(newFile);
//   } catch (error) {
//     handleError(error, "Failed to upload file");
//   }
// };

export const uploadFile = async ({
  file,
  ownerId,
  accountId,
  path,
}: UploadFileProps) => {
  const { storage, databases } = await createAdminClient();

  try {
    const inputFile = InputFile.fromBuffer(file, file.name);

    const bucketFile = await storage.createFile(
      appwriteConfig.bucketId,
      ID.unique(),
      inputFile
    );

    const fileDocument = {
      type: getFileType(bucketFile.name).type,
      name: bucketFile.name,
      url: constructFileUrl(bucketFile.$id),
      extension: getFileType(bucketFile.name).extension,
      size: bucketFile.sizeOriginal,
      owner: ownerId,
      accountId,
      users: [],
      bucketFileId: bucketFile.$id,
    };

    const newFile = await databases
      .createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.fileCollectionId,
        ID.unique(),
        fileDocument
      )
      .catch(async (error: unknown) => {
        await storage.deleteFile(appwriteConfig.bucketId, bucketFile.$id);
        handleError(error, "Failed to create file document");
      });

    revalidatePath(path);
    return parseStringify(newFile);
  } catch (error) {
    console.error("UPLOAD ERROR:", error);
    handleError(error, "Failed to upload file");
  }
};

const createQueries = (currentUser: Models.Document) => {
  const queries = [
    Query.or([
      Query.equal("owner", [currentUser.$id]),
      Query.contains("users", [currentUser.email]),
    ]),
  ];
  // TODO: Search sort Limits
  return queries;
};

export const getFiles = async () => {
  const { databases } = await createAdminClient();
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) throw new Error("User not Found");
    const queries = createQueries(currentUser);
    const files = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.fileCollectionId,
      queries
    );
    console.log(parseStringify(files), "files");
    return parseStringify(files);
  } catch (error) {
    handleError(error, "Failed to get files");
  }
};

export const renameFile = async ({
  fileId,
  name,
  extension,
  path,
}: RenameFileProps) => {
  const { databases } = await createAdminClient();
  try {
    const newname = `${name}-${extension}`;
    const updatedFile = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.fileCollectionId,
      fileId,
      { name: newname }
    );
    revalidatePath(path);
    return parseStringify(updatedFile);
  } catch (error) {
    handleError(error, "Failed to rename file");
  }
};

export const updateFileUsers = async ({
  fileId,
  emails,
  path,
}: UpdateFileUsersProps) => {
  const { databases } = await createAdminClient();
  try {
    const updatedFile = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.fileCollectionId,
      fileId,
      { users: emails }
    );
    revalidatePath(path);
    console.log(parseStringify(updatedFile), "updatedfile");
    return parseStringify(updatedFile);
  } catch (error) {
    handleError(error, "Failed to update file");
  }
};
