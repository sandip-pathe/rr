"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import CustomModal from "@/components/ModalWrapper"; // our portal-based modal
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { FIREBASE_DB } from "@/FirebaseConfig";
import { Input } from "@/components/ui/input"; // your custom input component
import { Button } from "@/components/ui/button"; // your custom button component
import DatePickerShadCN from "./DatePicker";
import "react-datepicker/dist/react-datepicker.css";

interface TaskFormValues {
  title: string;
  description: string;
  dueDate: Date | null;
  stageId: string | null;
}

interface TaskEditModalProps {
  taskId: string;
  initialData: TaskFormValues;
  isOpen: boolean;
  onClose: () => void;
}

const TaskEditModal: React.FC<TaskEditModalProps> = ({
  taskId,
  initialData,
  isOpen,
  onClose,
}) => {
  const { register, handleSubmit, setValue, watch } = useForm<TaskFormValues>({
    defaultValues: initialData,
  });
  const [isSaving, setIsSaving] = useState(false);

  // Ensure form values are updated if initialData changes
  useEffect(() => {
    if (initialData) {
      setValue("title", initialData.title);
      setValue("description", initialData.description);
      setValue("dueDate", initialData.dueDate);
      setValue("stageId", initialData.stageId);
    }
  }, [initialData, setValue]);

  const onSubmit = async (data: TaskFormValues) => {
    setIsSaving(true);
    try {
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
        dueDate: data.dueDate ? data.dueDate.toISOString() : null,
        stageId: data.stageId,
      });
      onClose();
    } catch (error) {
      console.error("Failed to update task:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      const taskDocRef = doc(
        FIREBASE_DB,
        "projects",
        "JMZrskwo5m2w2e6upcfa",
        "tasks",
        taskId
      );
      await deleteDoc(taskDocRef);
      onClose();
    } catch (error) {
      console.error("Failed to delete task:", error);
    }
  };

  return (
    <CustomModal isOpen={isOpen} onClose={onClose}>
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
          <DatePickerShadCN />
        </div>
        <div>
          <label className="block text-sm font-medium">Stage ID</label>
          <Input {...register("stageId")} placeholder="Enter stage id" />
        </div>
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="destructive" onClick={handleDelete}>
            Delete
          </Button>
          <Button type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      </form>
    </CustomModal>
  );
};

export default TaskEditModal;
