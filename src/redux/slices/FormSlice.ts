import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface FormDataState {
    value: boolean;
    formData: Record<string, any>; // Form data as a key-value object
    isUpdate: {
        is_update: boolean;
        task_id: string | null;
    }; // Tracks update state and task ID
    parent_id: number | null; // parent_id as a number
}

const initialState: FormDataState = {
    value: false,
    formData: {}, // Initialize formData as an empty object
    isUpdate: {
        is_update: false, // Not in update mode initially
        task_id: null,    // No task ID initially
    },
    parent_id: null, // Initialize parent_id as null
};

const FormSlice = createSlice({
    name: "formData",
    initialState,
    reducers: {
        setTrue: (state) => {
            state.value = true;
        },
        setFalse: (state) => {
            state.value = false;
        },
        setFormData: (state, action: PayloadAction<Record<string, any>>) => {
            state.formData = action.payload;
        },
        resetFormData: (state) => {
            state.formData = {};
        },
        setIsUpdate: (
            state,
            action: PayloadAction<{ is_update: boolean; task_id: string | null }>
        ) => {
            state.isUpdate = action.payload;
        },
        resetIsUpdate: (state) => {
            state.isUpdate = { is_update: false, task_id: null };
        },
        setParentId: (state, action: PayloadAction<number | null>) => {
            state.parent_id = action.payload; // Set parent_id as a number
        },
        resetParentId: (state) => {
            state.parent_id = null; // Reset parent_id to null
        },
    },
});

export const {
    setTrue,
    setFalse,
    setFormData,
    resetFormData,
    setIsUpdate,
    resetIsUpdate,
    setParentId,  // Exporting the action to set parent_id
    resetParentId, // Exporting the action to reset parent_id
} = FormSlice.actions;

export default FormSlice.reducer;
