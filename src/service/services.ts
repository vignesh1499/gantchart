// firebaseService.ts
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  deleteDoc,
  getDocs,
  query,
  orderBy,
  increment,
  updateDoc,
} from "firebase/firestore";
import { v4 as uuidv4 } from "uuid"; // For generating unique fallback IDs
import { db } from "../utils/firebase";
import { toast } from "react-toastify";
import { calculateDurationInDays, convertTimestampToDate } from "../utils/commonFunction";

// Task collection reference
const tasksCollection = collection(db, "tasks");
const counterDocRef = doc(db, "Counter", "taskCounter");

export interface Task {
  id?: number;
  uid?: any;
  text: string;
  status: string;
  start_date: Date;
  end_date: Date;
  priority: string;
  assignees: string;
  color: string;
  progress: number;
  description: string;
  files: File[];
}

export const TaskService = {
  /**
   * Generate a unique numeric ID for a task.
   */
  async generateUniqueNumericId(): Promise<number> {
    const counterSnapshot = await getDoc(counterDocRef);
    if (counterSnapshot.exists()) {
      await updateDoc(counterDocRef, { count: increment(1) });
      return counterSnapshot.data().count + 1;
    } else {
      // Initialize counter if not already set
      await setDoc(counterDocRef, { count: 1 });
      return 1;
    }
  },

  /**
   * Add a new task.
   * @param task Partial<Task>
   */
  async addTask(task: Omit<Task, "id" | "uid">): Promise<Task> {
    const numericId = await this.generateUniqueNumericId();
    const uid = uuidv4(); // Fallback ID
    const newTask: Task = { ...task, id: numericId, uid };

    const taskDocRef = doc(tasksCollection, uid);
    await setDoc(taskDocRef, newTask);
    return newTask;
  },

  /**
   * Update an existing task by UID.
   * @param uid string
   * @param updatedTask Partial<Task>
   */
  async updateTask(uid: string, updatedTask: Partial<Task>): Promise<void> {
    const taskDocRef = doc(tasksCollection, uid);
    await updateDoc(taskDocRef, updatedTask);
  },

  /**
   * Delete a task by UID.
   * @param uid string
   */
  async deleteTask(uid: string): Promise<void> {
    const taskDocRef = doc(tasksCollection, uid);
    await deleteDoc(taskDocRef);
  },

  /**
   * Get all tasks.
   */
  async getAllTasks(): Promise<Task[]> {
    const q = query(tasksCollection, orderBy("id", "asc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => doc.data() as Task);
  },


  /**
   * Get a task by UID.
   * @param uid string
   */
  async getTaskById(uid: string): Promise<Task | null> {
    const taskDocRef = doc(tasksCollection, uid);
    const taskSnapshot = await getDoc(taskDocRef);
    return taskSnapshot.exists() ? (taskSnapshot.data() as Task) : null;
  },
};
