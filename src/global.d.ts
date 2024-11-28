// src/global.d.ts
declare global {
  interface Window {
    addSubTask: (taskId: number) => void;
    updateTask: (taskId: number) => void;
    deleteTask: (taskUID:string) => void;
  }
}

export {};
