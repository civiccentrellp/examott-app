
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "./firebase";

/**
 * Uploads a file to Firebase Storage under a specified folder.
 *
 * @param file - The file to upload
 * @param folder - Folder path in Firebase Storage (e.g. 'course-images', 'questions/{id}', 'dbms')
 * @param customFileName - Optional custom file name
 * @returns A promise resolving to the download URL
 */
export const uploadFileToFirebase = async (
  file: File,
  folder: string,
  customFileName?: string
): Promise<string> => {
  if (!file) throw new Error("No file provided for upload");

  const fileName = customFileName || `${Date.now()}-${file.name}`;
  const storageRef = ref(storage, `${folder}/${fileName}`);
  const snapshot = await uploadBytes(storageRef, file, {
    contentType: file.type,
  });
  
  const downloadURL = await getDownloadURL(snapshot.ref);
  return downloadURL;
  
};

export const uploadCourseImage = async (file: File): Promise<string> => {
  return uploadFileToFirebase(file, "course-images");
};
