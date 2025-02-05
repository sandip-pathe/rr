"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import CustomModal from "@/components/ModalWrapper"; // our portal-based modal
import {
  doc,
  updateDoc,
  deleteDoc,
  addDoc,
  collection,
} from "firebase/firestore";
import { FIREBASE_DB } from "@/FirebaseConfig";
import { Input } from "@/components/ui/input"; // your custom input component
import { Button } from "@/components/ui/button"; // your custom button component
import DatePickerShadCN from "./DatePicker";
import { useSearchParams } from "next/navigation";
import "react-datepicker/dist/react-datepicker.css";

interface TaskFormValues {
  title: string;
  description: string;
  dueDate: Date | undefined;
  stageId: string | null;
}

interface TaskEditModalProps {
  taskId: string;
  // In edit mode, initialData.dueDate might be an ISO string or Date.
  initialData?: Omit<TaskFormValues, "dueDate"> & { dueDate?: string | Date };
  isOpen: boolean;
  onClose: () => void;
}

const TaskEditModal: React.FC<TaskEditModalProps> = ({
  taskId,
  initialData,
  isOpen,
  onClose,
}) => {
  const searchParams = useSearchParams();
  const urlStageId = searchParams.get("columnId");

  // Convert initial dueDate (if present) to a Date object.
  const convertDueDate = (d: string | Date | undefined) => {
    if (!d) return undefined;
    return d instanceof Date ? d : new Date(d);
  };
  const convertedDueDate = convertDueDate(initialData?.dueDate);

  // When creating a new task, default to today's date.
  const defaultDueDate = convertedDueDate ?? new Date();

  const {
    register,
    handleSubmit,
    setValue,
    reset, // used for resetting form values when modal opens
  } = useForm<TaskFormValues>();

  const [isSaving, setIsSaving] = useState(false);
  // Local state for the date picker.
  const [date, setDate] = useState<Date | undefined>(defaultDueDate);

  // Reset the form only once when the modal first opens.
  useEffect(() => {
    if (isOpen) {
      const newDefaults: TaskFormValues = initialData
        ? {
            title: initialData.title,
            description: initialData.description,
            dueDate: convertedDueDate ?? new Date(),
            stageId: initialData.stageId,
          }
        : {
            title: "",
            description: "",
            dueDate: new Date(),
            stageId: urlStageId || null,
          };
      reset(newDefaults);
      setDate(newDefaults.dueDate);
    }
    // Only run when isOpen changes.
  }, [isOpen]);

  // Whenever the local date state changes, update the form field.
  useEffect(() => {
    setValue("dueDate", date);
  }, [date, setValue]);

  const closeModal = () => {
    const params = new URLSearchParams(window.location.search);
    params.delete("modalId");
    params.delete("columnId");
    const newUrl = `${window.location.pathname}${
      params.toString() ? "?" + params.toString() : ""
    }`;
    window.history.replaceState(null, "", newUrl);
    onClose();
  };

  const onSubmit = async (data: TaskFormValues) => {
    setIsSaving(true);
    try {
      if (taskId === "new") {
        // CREATE new task
        const tasksCollectionRef = collection(
          FIREBASE_DB,
          "projects",
          "JMZrskwo5m2w2e6upcfa",
          "tasks"
        );
        await addDoc(tasksCollectionRef, {
          title: data.title,
          description: data.description,
          dueDate: data.dueDate
            ? data.dueDate.toISOString()
            : new Date().toISOString(),
          stageId: data.stageId,
        });
      } else {
        // UPDATE existing task
        const taskDocRef = doc(
          FIREBASE_DB,
          "projects",
          "JMZrskwo5m2w2e6upcfa",
          "tasks",
          taskId
        );
        await updateDoc(taskDocRef, {
          title: data.title,
          description: data.description,
          dueDate: data.dueDate
            ? data.dueDate.toISOString()
            : new Date().toISOString(),
          stageId: data.stageId,
        });
      }
      closeModal();
    } catch (error) {
      console.error("Failed to save task:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (taskId === "new") return;
    try {
      const taskDocRef = doc(
        FIREBASE_DB,
        "projects",
        "JMZrskwo5m2w2e6upcfa",
        "tasks",
        taskId
      );
      await deleteDoc(taskDocRef);
      closeModal();
    } catch (error) {
      console.error("Failed to delete task:", error);
    }
  };

  return (
    <CustomModal isOpen={isOpen} onClose={closeModal}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Title</label>
          <Input {...register("title")} placeholder="Enter title" />
        </div>
        <div>
          <label className="block text-sm font-medium">Description</label>
          <textarea
            {...register("description")}
            placeholder="Enter description"
            className="w-full p-2 border rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Due Date</label>
          <DatePickerShadCN date={date} setDate={setDate} />
        </div>
        <div>
          <label className="block text-sm font-medium">Stage ID</label>
          <Input {...register("stageId")} placeholder="Enter stage id" />
        </div>
        <div className="flex justify-end space-x-2">
          {taskId !== "new" && (
            <Button type="button" variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          )}
          <Button type="button" onClick={closeModal}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? "Saving..." : taskId === "new" ? "Create" : "Save"}
          </Button>
        </div>
      </form>
    </CustomModal>
  );
};

export default TaskEditModal;
