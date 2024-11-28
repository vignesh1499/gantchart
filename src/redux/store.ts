import { configureStore } from "@reduxjs/toolkit";
import formDataReducer from './slices/FormSlice'

export const store = configureStore({
    reducer:{
        taskDetails: formDataReducer
    }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;