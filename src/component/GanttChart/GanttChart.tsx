import React, { useEffect, useRef, useState } from "react";
import Gantt from "dhtmlx-gantt";
import "dhtmlx-gantt/codebase/dhtmlxgantt.css";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  setFalse,
  setFormData,
  setIsUpdate,
  setParentId,
  setTrue,
} from "../../redux/slices/FormSlice";
import AddTaskForm from "../NewTask/AddTaskForm";
import { TaskService } from "../../service/services";
import { AppDispatch, RootState } from "../../redux/store";
import { toast } from "react-toastify";
import { fetchAllTasks } from "../../utils/commonFunction";
import SearchNav from "../SearchNav/SearchNav";

const gantt: any = Gantt;

const GanttChart: React.FC = () => {
  const ganttContainerRef = useRef<HTMLDivElement>(null);
  const dispatch: AppDispatch = useDispatch();
  const [zoomLevel, setZoomLevel] = useState("days");
  const formBoolean = useSelector(
    (state: RootState) => state.taskDetails.value
  );
  const today = new Date();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    // Redirect to login page if the token is missing
    if (!token) {
      navigate("/");
    }
  }, [navigate]);

  const onSubmit = (task: any) => {
    console.log("Task",task);
    return task;
  };

  const handleTaskDelete = async (taskId: string) => {
    try {
      const getTasks = await TaskService.getAllTasks();
      const task = getTasks.find((task: any) => task.id === taskId);
      console.log("delete", task?.uid);
      const deleteTask = await TaskService.deleteTask(task?.uid);
      toast.success("Task Deleted Successfully");
      await fetchAllTasks();
    } catch (error) {
      toast.error("Something went wrong");
      console.error("Error deleting task:", error);
    }
  };

  const getUpdateTask = async (taskId: string) => {
    const getTasks = await TaskService.getAllTasks();
    const task: any = getTasks.find((task: any) => task.id === taskId);
    console.log("task", task);
    dispatch(setFormData(task));
  };

  useEffect(() => {
    fetchAllTasks(); // Fetch tasks on initial render
  }, []);

  useEffect(() => {
    if (ganttContainerRef.current) {
      // Set up primary scale (weeks) with custom formatting for week range
      gantt.config.scale_unit = 'week';

      // Custom date scale for weeks to display "start date - end date"
      gantt.templates.date_scale = function (start:any) {
        const weekStart = gantt.date.date_to_str('%d %M')(start); // Format week start date
        const weekEnd = gantt.date.date_to_str('%d %M')(gantt.date.add(start, 6, 'day')); // Calculate and format week end date
        return `${weekStart} - ${weekEnd}`;
      };


      // Customize the display for each day in the subscale (optional)
      gantt.templates.subscale_cell = function (date:any) {
        return gantt.date.date_to_str('%M')(date); // Only show the day number (e.g., "01", "02", etc.)
      };

      // Initialize Gantt Chart
      gantt.init(ganttContainerRef.current);
  
      gantt.config.columns = [
        {
          name: "text",
          label: "Task Name",
          width: "*",
          tree: true,
          template: function (task: any) {
            return `
              <div style="display: flex; align-items: center; justify-content: flex-start;">
                <p style="margin: 0; text-align: left !important; width: 100px;">${task.text}</p>
                <div style="display: flex; gap: 5px;">
                  <button class="task-actions add-btn" onClick="window.addSubTask(${task.id})">
                    <i class="fa-solid fa-plus"></i>
                  </button>
                  <button class="task-actions edit-btn" onClick="window.updateTask(${task.id})">
                    <i class="fa-solid fa-pen"></i>
                  </button>
                  <button class="task-actions delete-btn" onClick="window.deleteTask(${task.id})">
                    <i class="fa-solid fa-trash"></i>
                  </button>
                </div>
              </div>
            `;
          },
        },
      ];

      gantt.attachEvent("onTaskDblClick", function (id: any, e: any) {
        return true;
      });

      window.addSubTask = (id: any) => {
        dispatch(setTrue());
        dispatch(setParentId(id));
      };

      window.updateTask = (taskId: any) => {
        dispatch(setTrue());
        dispatch(setIsUpdate({ is_update: true, task_id: taskId }));
        getUpdateTask(taskId);
      };

      window.deleteTask = (taskId: any) => {
        gantt.deleteTask(taskId); // Call the delete function on gantt
        handleTaskDelete(taskId); // Call delete service
      };

      return () => {
        gantt.clearAll(); // Clean up Gantt on unmount
      };
    }
  }, [fetchAllTasks]);

  useEffect(() => {
    if (zoomLevel === "hours") {
      gantt.config.scale_unit = "day";
      gantt.config.date_scale = "%H:%i";
      gantt.config.subscales = [{ unit: "hour", step: 1, date: "%H:%i" }];
    } else {
      gantt.config.scale_unit = "month";
      gantt.config.date_scale = "%F %Y";
      gantt.config.subscales = [{ unit: "day", step: 1, date: "%j, %D" }];
    }
    gantt.render();
  }, [zoomLevel]);

  return (
    <div>
      <SearchNav />
      <div
        ref={ganttContainerRef}
        style={{ width: "100%", height: "600px" }}
      ></div>
      <div
        style={{
          position: "fixed",
          top: "200px",
          right: "20px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          backgroundColor: "white",
          borderRadius: "25px",
          padding: "10px",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
          zIndex: 1000,
        }}
      >
        <button
          onClick={() => setZoomLevel("hours")}
          style={{
            backgroundColor: "transparent",
            border: "none",
            color: "#A8A8A8",
            fontSize: "25px",
            cursor: "pointer",
            marginBottom: "10px",
          }}
        >
          +
        </button>
        <button
          onClick={() => setZoomLevel("months")}
          style={{
            backgroundColor: "transparent",
            border: "none",
            color: "#A8A8A8",
            fontSize: "25px",
            cursor: "pointer",
          }}
        >
          -
        </button>
      </div>
      <div>
        <AddTaskForm
          open={formBoolean}
          onClose={() => dispatch(setFalse())}
          onCreate={(taskData) => {
            onSubmit(taskData);
          }}
        />
      </div>
    </div>
  );
};

export default GanttChart;
