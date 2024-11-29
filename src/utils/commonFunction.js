import gantt from "dhtmlx-gantt";
import { TaskService } from "../service/services";
import { toast } from "react-toastify";

export const convertTimestampToDate = (timestamp) => {
  const date = new Date(timestamp);
  return date; // Make sure it returns a valid date object
};

export const normalizeToUTC = dateStr => {
  const date = new Date(dateStr);
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
};


export const calculateDurationInDays = (startDate, endDate) => {
  const timeDiff = new Date(endDate).getTime() - new Date(startDate).getTime(); // Difference in milliseconds
  const dayInMilliseconds = 1000 * 3600 * 24; // Number of milliseconds in a day
  return Math.ceil(timeDiff / dayInMilliseconds); // Calculate and round up to the nearest day
};

// Get All Tasks
export const fetchAllTasks = async () => {
  try {
    const getAll = await TaskService.getAllTasks();
    console.log("All Tasks", getAll);
    if (getAll.length === 0) {
      toast.info("No Data to Show");
    } else {
      const tasks = getAll.map((task) => {
        console.log("data", task);

        const duration = calculateDurationInDays(
          task.start_date,
          task.end_date
        );

        console.log("data", task);

        const startDate = convertTimestampToDate(task.start_date)
          .toISOString()
          .split("T")[0];

          console.log("start_date",startDate);
          
        return {
          id: task.id,
          text: task.text,
          start_date: normalizeToUTC(task.start_date),
          end_date: normalizeToUTC(task.end_date),
          duration: duration,
          progress: task.progress || 0,
          parent: task.parent || 0,
        };
      });

      gantt.parse({
        data: tasks,
        links: [],
      });
    }
  } catch (error) {
    toast.error("Something Went Wrong, Please try again later");
    console.error("Error fetching tasks:", error);
  }
};
