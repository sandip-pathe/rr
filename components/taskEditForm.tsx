"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { useSearchParams } from "next/navigation";
import CustomModal from "@/components/ModalWrapper";
import { Button } from "@/components/ui/button";
import DatePickerShadCN from "./DatePicker";
import {
  doc,
  updateDoc,
  deleteDoc,
  addDoc,
  collection,
} from "firebase/firestore";
import { FIREBASE_DB } from "@/FirebaseConfig";
import "react-datepicker/dist/react-datepicker.css";
import CustomFormField from "./CustomFormField";
import { FormFieldType } from "@/enum/FormFieldTypes";

interface TaskFormValues {
  title: string;
  description: string;
  dueDate: Date | undefined;
  stageId: string | null;
}

interface TaskEditModalProps {
  taskId: string;
  initialData?: Partial<TaskFormValues> & { dueDate?: string | Date };
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
  const projectId = searchParams.get("projectId") as string;

  const { control, register, handleSubmit, reset, setValue } =
    useForm<TaskFormValues>({
      defaultValues: {
        title: "",
        description: "",
        dueDate: new Date(),
        stageId: null,
      },
    });

  const [isSaving, setIsSaving] = useState(false);
  const [date, setDate] = useState<Date | undefined>(
    initialData?.dueDate ? new Date(initialData.dueDate) : new Date()
  );

  useEffect(() => {
    if (isOpen) {
      reset({
        title: initialData?.title || "",
        description: initialData?.description || "",
        dueDate: initialData?.dueDate
          ? new Date(initialData.dueDate)
          : new Date(),
        stageId: initialData?.stageId || urlStageId || null,
      });
      setDate(
        initialData?.dueDate ? new Date(initialData.dueDate) : new Date()
      );
    }
  }, [isOpen, initialData, urlStageId, reset]);

  useEffect(() => {
    setValue("dueDate", date);
  }, [date, setValue]);

  const closeModal = useCallback(() => {
    const params = new URLSearchParams(window.location.search);
    ["modalId", "columnId"].forEach((param) => params.delete(param));
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}${
        params.toString() ? "?" + params.toString() : ""
      }`
    );
    onClose();
  }, [onClose]);

  const onSubmit = async (data: TaskFormValues) => {
    setIsSaving(true);
    try {
      const payload = {
        title: data.title,
        description: data.description,
        dueDate: data.dueDate
          ? data.dueDate.toISOString()
          : new Date().toISOString(),
        stageId: data.stageId,
      };

      if (taskId === "new") {
        await addDoc(
          collection(FIREBASE_DB, "projects", projectId, "tasks"),
          payload
        );
      } else {
        await updateDoc(
          doc(FIREBASE_DB, "projects", projectId, "tasks", taskId),
          payload
        );
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
      await deleteDoc(doc(FIREBASE_DB, "projects", projectId, "tasks", taskId));
      closeModal();
    } catch (error) {
      console.error("Failed to delete task:", error);
    }
  };

  return (
    <CustomModal isOpen={isOpen} onClose={closeModal}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <CustomFormField
          control={control}
          fieldType={FormFieldType.INPUT}
          name="title"
          label="Task Title"
          placeholder="Enter task title"
        />
        <CustomFormField
          control={control}
          fieldType={FormFieldType.TEXTAREA}
          name="description"
          label="Description"
          placeholder="Enter task details"
        />
        <DatePickerShadCN date={date} setDate={setDate} />
        <CustomFormField
          control={control}
          fieldType={FormFieldType.INPUT}
          name="stageId"
          label="Stage ID"
          placeholder="Enter stage ID"
        />
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
