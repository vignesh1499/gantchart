import React, { useEffect, useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import InputLabel from "@mui/material/InputLabel";
import Grid from "@mui/material/Grid";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Box } from "@mui/material";
import { TaskService } from "../../service/services";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../redux/store";
import {
  resetFormData,
  resetIsUpdate,
  resetParentId,
} from "../../redux/slices/FormSlice";
import { toast } from "react-toastify";
import { fetchAllTasks } from "../../utils/commonFunction";

const theme = createTheme({
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            height: "45px",
            width: "300px",
            borderRadius: "7px",
          },
          "& .MuiInputLabel-root": {
            fontFamily: "Arial, sans-serif",
            fontSize: "16px",
            fontWeight: "bold",
            color: "#000",
          },
          "& .MuiInputBase-input": {
            fontSize: "14px",
            padding: "12px",
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          height: "45px",
          width: "300px",
          borderRadius: "7px",
        },
        outlined: {
          width: "300px",
          borderRadius: "7px",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: "8px",
        },
      },
    },
  },
});

interface TaskFormProps {
  open: boolean;
  onClose: () => void;
  onCreate: (task: Task) => void;
}

interface Task {
  id?: number;
  text: string;
  status: string;
  start_date: string;
  end_date: string;
  priority: string;
  assignees: string;
  color: string;
  progress: number;
  description: string;
  files: File[];
}

const AddTaskForm: React.FC<TaskFormProps> = ({ open, onClose, onCreate }) => {
  const dispatch = useDispatch();
  const isUpdate = useSelector((state: RootState) => state.taskDetails.isUpdate);
  const formData: any = useSelector(
    (state: RootState) => state.taskDetails.formData
  );
  const parentId = useSelector(
    (state: RootState) => state.taskDetails.parent_id
  );
  const today = new Date().toISOString().split("T")[0];

  const defaultTaskState: Task = {
    text: "",
    status: "TO_DO", // Default to "TO_DO"
    start_date: today,
    end_date: today,
    priority: "LOW", // Default priority to "LOW"
    assignees: "",
    color: "#0000FF", // Default color to blue
    progress: 0,
    description: "",
    files: [],
  };

  const [task, setTask] = useState<Task>(defaultTaskState);

  const resetToDefaultState = () => {
    setTask(defaultTaskState);
  };

  useEffect(() => {
    if (isUpdate.is_update === false) {
      resetToDefaultState();
    } else {
      setTask(formData || defaultTaskState); // Default to taskState if formData is null/undefined
    }
  }, [isUpdate, formData]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setTask((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    if (name) {
      setTask((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setTask((prev) => ({ ...prev, files: Array.from(e.target.files!) }));
    }
  };

  const handleSubmit = () => {
    if (isUpdate.is_update) {
      handleUpdateTask(task);
    } else {
      handleAddTask(task);
    }
    resetToDefaultState();
    dispatch(resetIsUpdate());
    dispatch(resetFormData());
    onClose();
  };

  const handleCancel = () => {
    resetToDefaultState();
    dispatch(resetIsUpdate());
    dispatch(resetFormData());
    onClose();
  };

  // Add Task
  const handleAddTask = async (task: any) => {
    let taskData = task;
    try {
      if (parentId !== 0 || null) {
        taskData = { ...taskData, parent: parentId };
      }
      const addedTask = await TaskService.addTask(taskData);
      toast.success("New Task Added Successfully");
      console.log("Task added:", addedTask);
      dispatch(resetParentId());
      dispatch(resetFormData());
      await fetchAllTasks()
    } catch (error) {
      toast.error("Something went wrong");
      console.error("Error adding task:", error);
    }
  };

  const handleUpdateTask = async (task: any) => {
    try {
      const updateTask = await TaskService.updateTask(task.uid, task); // Ensure you're passing the task ID
      toast.success("Task Updated Successfully");
      console.log("Task updated:", updateTask);
      dispatch(resetParentId());
      dispatch(resetFormData());
      await fetchAllTasks();
    } catch (error) {
      toast.error("Something went wrong");
      console.error("Error updating task:", error);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Dialog open={open} onClose={handleCancel} maxWidth="md">
        <DialogTitle style={{ fontWeight: "bold", color: "#5A55CA" }}>
          {isUpdate.is_update ? "Update Task" : "New Task"}
        </DialogTitle>
        <DialogContent>
          <Box>
            <Grid container spacing={2}>
              {/* Task Name */}
              <Grid item xs={6}>
                <InputLabel>Task Name</InputLabel>
                <TextField
                  placeholder="Enter the Task Name"
                  name="text"
                  value={task.text}
                  onChange={handleInputChange}
                  required
                />
              </Grid>

              {/* Status */}
              <Grid item xs={6}>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={task.status || ""} // Ensure the value is never undefined
                  onChange={handleSelectChange}
                  required
                >
                  <MenuItem value="TO_DO">To-Do</MenuItem>
                  <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                  <MenuItem value="DONE">Done</MenuItem>
                </Select>
              </Grid>

              {/* Start Date */}
              <Grid item xs={6}>
                <InputLabel>Start Date</InputLabel>
                <TextField
                  name="start_date"
                  type="date"
                  value={task.start_date}
                  onChange={handleInputChange}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  required
                  inputProps={{ min: today }}
                />
              </Grid>

              {/* End Date */}
              <Grid item xs={6}>
                <InputLabel>End Date</InputLabel>
                <TextField
                  name="end_date"
                  type="date"
                  value={task.end_date}
                  onChange={handleInputChange}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  required
                  inputProps={{ min: today }}
                />
              </Grid>

              {/* Priority */}
              <Grid item xs={6}>
                <InputLabel>Priority</InputLabel>
                <Select
                  name="priority"
                  value={task.priority || ""} // Ensure the value is never undefined
                  onChange={handleSelectChange}
                  required
                >
                  <MenuItem value="LOW">Low</MenuItem>
                  <MenuItem value="MEDIUM">Medium</MenuItem>
                  <MenuItem value="HIGH">High</MenuItem>
                </Select>
              </Grid>

              {/* Assignees */}
              <Grid item xs={6}>
                <InputLabel>Assignees</InputLabel>
                <TextField
                  placeholder="e.g., example@mail.com"
                  name="assignees"
                  value={task.assignees}
                  onChange={handleInputChange}
                  required
                />
              </Grid>

              {/* Color */}
              <Grid item xs={6}>
                <InputLabel>Color</InputLabel>
                <Select
                  name="color"
                  value={task.color || ""} // Ensure the value is never undefined
                  onChange={handleSelectChange}
                  required
                >
                  <MenuItem value="#EE00FF">Pink</MenuItem>
                  <MenuItem value="#FF0000">Red</MenuItem>
                  <MenuItem value="#00FF00">Green</MenuItem>
                </Select>
              </Grid>

              {/* Progress */}
              <Grid item xs={6}>
                <InputLabel>Progress</InputLabel>
                <TextField
                  name="progress"
                  type="number"
                  value={task.progress}
                  onChange={handleInputChange}
                  inputProps={{ min: 0, max: 100 }}
                />
              </Grid>

              {/* Description */}
              <Grid item xs={12}>
                <InputLabel>Description</InputLabel>
                <TextField
                  placeholder="Enter task description"
                  name="description"
                  value={task.description}
                  onChange={handleInputChange}
                  fullWidth
                  multiline
                  rows={4}
                />
              </Grid>

              {/* Files */}
              <Grid item xs={12}>
                <InputLabel>Upload Files</InputLabel>
                <input type="file" multiple onChange={handleFileChange} />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleSubmit}
            style={{
              backgroundColor: "#5A55CA",
              color: "#fff",
              padding: "8px 16px",
            }}
          >
            {isUpdate.is_update ? "Update" : "Create"}
          </Button>
          <Button
            onClick={handleCancel}
            style={{
              border: "1px solid black",
              color: "black",
            }}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
};

export default AddTaskForm;
