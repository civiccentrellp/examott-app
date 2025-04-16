// src/utils/firebaseUpload.ts
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "./firebase";

export const uploadCourseImage = async (file: File): Promise<string> => {
  if (!file) throw new Error("No file provided for upload");

  const storageRef = ref(storage, `course-images/${Date.now()}-${file.name}`);
  const snapshot = await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(snapshot.ref);

  return downloadURL;
};
