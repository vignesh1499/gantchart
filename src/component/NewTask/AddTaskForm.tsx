import React, { useEffect, useState } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import { FiBold, FiItalic, FiLink, FiImage, FiList } from "react-icons/fi"; // Use FaListOl for ordered list
import { FaListOl } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import {
  resetFormData,
  resetIsUpdate,
  resetParentId,
} from "../../redux/slices/FormSlice";
import { TaskService } from "../../service/services";
import { fetchAllTasks } from "../../utils/commonFunction";
import { toast } from "react-toastify";

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
  const today = new Date().toISOString().split("T")[0];
  const dispatch = useDispatch();
  const isUpdate = useSelector(
    (state: RootState) => state.taskDetails.isUpdate
  );
  const formData: any = useSelector(
    (state: RootState) => state.taskDetails.formData
  );
  const parentId = useSelector(
    (state: RootState) => state.taskDetails.parent_id
  );

  const defaultTaskState: Task = {
    text: "",
    status: "TO_DO",
    start_date: today,
    end_date: today,
    priority: "LOW",
    assignees: "",
    color: "white",
    progress: 0,
    description: "",
    files: [],
  };

  const [task, setTask] = useState<Task>(defaultTaskState);
  const [description, setDescription] = useState<string>(task.description);
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});

  const resetToDefaultState = () => {
    setTask(defaultTaskState);
    setDescription("");
    setValidationErrors({});
  };

  const validateField = (name: string, value: string) => {
    let error = "";
    switch (name) {
      case "text":
        if (!value) error = "Task name is required.";
        break;
      case "start_date":
      case "end_date":
        if (!value) error = "Date is required.";
        else if (name === "end_date" && value < task.start_date) {
          error = "End date cannot be earlier than the start date.";
        }
        break;
      case "assignees":
        if (!value) error = "Assignee email is required.";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = "Invalid email format.";
        }
        break;
      case "progress":
        if (!value) error = "Progress is required.";
        else if (Number(value) < 0 || Number(value) > 100) {
          error = "Progress must be between 0 and 100.";
        }
        break;
      case "description":
        if (!value) error = "Description is required.";
        break;
      default:
        break;
    }
    return error;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setTask((prev) => ({ ...prev, [name]: value }));

    // Validate field
    const error = validateField(name, value);
    setValidationErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTask((prev) => ({ ...prev, [name]: value }));
  };

  const handleToolbarClick = (action: string) => {
    const textArea = document.getElementById(
      "descriptionTextArea"
    ) as HTMLTextAreaElement;
    const cursorPos = textArea.selectionStart;
    const textValue = textArea.value;

    switch (action) {
      case "bold":
        setDescription(
          textValue.slice(0, cursorPos) +
            "**" +
            textValue.slice(cursorPos, textArea.selectionEnd) +
            "**" +
            textValue.slice(textArea.selectionEnd)
        );
        break;
      case "italic":
        setDescription(
          textValue.slice(0, cursorPos) +
            "_" +
            textValue.slice(cursorPos, textArea.selectionEnd) +
            "_" +
            textValue.slice(textArea.selectionEnd)
        );
        break;
      case "link":
        const link = prompt("Enter the link URL:");
        if (link) {
          setDescription(
            textValue.slice(0, cursorPos) +
              "[" +
              textValue.slice(cursorPos, textArea.selectionEnd) +
              "](" +
              link +
              ")" +
              textValue.slice(textArea.selectionEnd)
          );
        }
        break;
      case "image":
        const imageUrl = prompt("Enter the image URL:");
        if (imageUrl) {
          setDescription(
            textValue.slice(0, cursorPos) +
              "![image](" +
              imageUrl +
              ")" +
              textValue.slice(textArea.selectionEnd)
          );
        }
        break;
      case "list":
        setDescription(
          textValue.slice(0, cursorPos) +
            "\n- " +
            textValue.slice(cursorPos, textArea.selectionEnd) +
            "\n" +
            textValue.slice(textArea.selectionEnd)
        );
        break;
      case "olist":
        setDescription(
          textValue.slice(0, cursorPos) +
            "\n1. " +
            textValue.slice(cursorPos, textArea.selectionEnd) +
            "\n" +
            textValue.slice(textArea.selectionEnd)
        );
        break;
      default:
        break;
    }
  };

  const handleSubmit = () => {
    const newErrors: { [key: string]: string } = {};
    Object.keys(task).forEach((key) => {
      const value = (task as any)[key];
      const error = validateField(key, value);
      if (error) newErrors[key] = error;
    });
    if (Object.keys(newErrors).length > 0) {
      setValidationErrors(newErrors);
      toast.error("Please fix the errors in the form.");
      return;
    }

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
      await fetchAllTasks();
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

  useEffect(() => {
    if (isUpdate.is_update === false) {
      resetToDefaultState();
    } else {
      setTask(formData || defaultTaskState); // Default to taskState if formData is null/undefined
    }
  }, [isUpdate, formData]);

  return (
    <Modal show={open} onHide={handleCancel} centered className="custom-modal">
      <div className="task-form-header text-left">
        <h3>{isUpdate.is_update ? "Update Task" : "New Task"}</h3>
      </div>
      <Modal.Body className="task-form-body">
        <Form>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="taskName">
                <Form.Label>Task Name</Form.Label>
                <Form.Control
                  type="text"
                  name="text"
                  placeholder="Enter the Task Name"
                  value={task.text}
                  onChange={handleInputChange}
                  required
                  className="input-field"
                />
                {validationErrors.text && (
                  <small className="text-danger">{validationErrors.text}</small>
                )}
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="status">
                <Form.Label>Status</Form.Label>
                <Form.Select
                  name="status"
                  value={task.status}
                  onChange={handleSelectChange}
                  required
                  className="input-field"
                >
                  <option value="TO_DO">To-Do</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="DONE">Done</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="startDate">
                <Form.Label>Start Date</Form.Label>
                <Form.Control
                  type="date"
                  name="start_date"
                  value={task.start_date}
                  min={today}
                  onChange={handleInputChange}
                  required
                  className="custom-date-input input-field"
                />
                {validationErrors.start_date && (
                  <small className="text-danger">
                    {validationErrors.start_date}
                  </small>
                )}
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="endDate">
                <Form.Label>End Date</Form.Label>
                <Form.Control
                  type="date"
                  name="end_date"
                  min={today}
                  value={task.end_date}
                  onChange={handleInputChange}
                  required
                  className="custom-date-input input-field"
                />
                {validationErrors.end_date && (
                  <small className="text-danger">
                    {validationErrors.end_date}
                  </small>
                )}
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="priority">
                <Form.Label>Priority</Form.Label>
                <Form.Select
                  name="priority"
                  value={task.priority}
                  onChange={handleSelectChange}
                  required
                  className="input-field"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="assignees">
                <Form.Label>Assignees</Form.Label>
                <Form.Control
                  type="email"
                  name="assignees"
                  placeholder="e.g., example@mail.com"
                  value={task.assignees}
                  onChange={handleInputChange}
                  required
                  className="input-field"
                />
                {validationErrors.assignees && (
                  <small className="text-danger">
                    {validationErrors.assignees}
                  </small>
                )}
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="color">
                <Form.Label>Color</Form.Label>
                <Form.Control
                  type="color"
                  name="color"
                  value={task.color}
                  onChange={handleInputChange}
                  required
                  className="input-field"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="progress">
                <Form.Label>Progress %</Form.Label>
                <Form.Control
                  type="number"
                  name="progress"
                  value={task.progress}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                  required
                  className="input-field"
                />
                {validationErrors.progress && (
                  <small className="text-danger">
                    {validationErrors.progress}
                  </small>
                )}
              </Form.Group>
            </Col>
          </Row>

          <Form.Group controlId="description" className="mb-3">
            <Form.Label>Task Description</Form.Label>
            <div className="toolbar">
              <FiBold onClick={() => handleToolbarClick("bold")} />
              <FiItalic onClick={() => handleToolbarClick("italic")} />
              <FiLink onClick={() => handleToolbarClick("link")} />
              <FiImage onClick={() => handleToolbarClick("image")} />
              <FiList onClick={() => handleToolbarClick("list")} />
              <FaListOl onClick={() => handleToolbarClick("olist")} />{" "}
              {/* Correct icon for ordered list */}
            </div>
            <Form.Control
              as="textarea"
              rows={4}
              name="description"
              id="descriptionTextArea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Type Task Description..."
              className="task-description-textarea"
            />
            {validationErrors.description && (
              <small className="text-danger">
                {validationErrors.description}
              </small>
            )}
          </Form.Group>

          <div
            style={{
              display: "flex",
              gap: "5px",
              justifyContent: "flex-end",
              padding: "8px 7px",
            }}
          >
            <Button
              style={{ width: "100px" }}
              variant="primary"
              onClick={handleSubmit}
            >
              Create
            </Button>
            <Button
              style={{ width: "100px" }}
              variant="secondary"
              onClick={handleCancel}
            >
              Cancel
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default AddTaskForm;
