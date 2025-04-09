"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useForm } from "react-hook-form";
import CustomModal from "@/components/ModalWrapper";
import {
  doc,
  updateDoc,
  deleteDoc,
  addDoc,
  collection,
} from "firebase/firestore";
import { FIREBASE_DB } from "@/FirebaseConfig";
import { Button } from "@/components/ui/button";
import DatePickerShadCN from "./DatePicker";
import { useSearchParams } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2, X, User, Users } from "lucide-react";
import CustomFormField from "@/components/CustomFormField";
import { Form } from "@/components/ui/form";
import { FormFieldType } from "@/enum/FormFieldTypes";
import { isValid } from "date-fns";

interface TaskFormValues {
  title: string;
  description: string;
  dueDate: Date | undefined;
  stageId: string | null;
  assignedUsers: {
    id: string;
    name: string;
  }[];
}

interface ProjectMember {
  id: string;
  name: string;
}

interface TaskEditModalProps {
  taskId: string;
  initialData?: {
    id?: string;
    title?: string;
    description?: string;
    dueDate?: string | Date;
    stageId?: string | null;
    assignedUsers?: ProjectMember[];
  };
  isOpen: boolean;
  onClose: () => void;
  projectMembers: ProjectMember[];
  projectAdmins: ProjectMember[];
}

const TaskEditModal: React.FC<TaskEditModalProps> = ({
  taskId,
  initialData = {},
  isOpen,
  onClose,
  projectMembers = [],
  projectAdmins = [],
}) => {
  const searchParams = useSearchParams();
  const urlStageId = searchParams.get("columnId");
  const projectId = searchParams.get("projectId");

  const [assignedUsers, setAssignedUsers] = useState<ProjectMember[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const convertDueDate = (d: string | Date | undefined): Date | undefined => {
    if (!d) return undefined;
    const date = d instanceof Date ? d : new Date(d);
    return isValid(date) ? date : undefined;
  };

  const form = useForm<TaskFormValues>({
    defaultValues: {
      title: "",
      description: "",
      dueDate: undefined,
      stageId: null,
      assignedUsers: [],
    },
  });

  const allProjectMembers = useMemo(() => {
    const combined = [...projectAdmins, ...projectMembers];
    return combined.filter(
      (member, index, self) =>
        index === self.findIndex((m) => m.id === member.id)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectMembers, projectAdmins]);

  const availableMembers = useMemo(() => {
    return allProjectMembers.filter(
      (member) => !assignedUsers.some((assigned) => assigned.id === member.id)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allProjectMembers, assignedUsers]);

  const initialDueDate = React.useMemo(
    () => convertDueDate(initialData?.dueDate),
    [initialData?.dueDate]
  );

  useEffect(() => {
    if (isOpen) {
      const initialAssignedUsers = Array.isArray(initialData?.assignedUsers)
        ? initialData.assignedUsers
        : [];

      form.reset({
        title: initialData?.title || "",
        description: initialData?.description || "",
        dueDate: initialDueDate,
        stageId: initialData?.stageId || urlStageId || null,
        assignedUsers: initialAssignedUsers,
      });
      setAssignedUsers(initialAssignedUsers);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const closeModal = () => {
    onClose();
  };

  const handleAssignUser = useCallback(
    (user: ProjectMember, isChecked: boolean) => {
      setAssignedUsers((prev) =>
        isChecked ? [...prev, user] : prev.filter((u) => u.id !== user.id)
      );
    },
    []
  );

  const onSubmit = async (data: TaskFormValues) => {
    setIsSaving(true);
    try {
      const taskData = {
        ...data,
        assignedUsers,
        dueDate: data.dueDate?.toISOString() || null,
      };

      if (taskId === "new") {
        await addDoc(
          collection(FIREBASE_DB, "projects", projectId as string, "tasks"),
          taskData
        );
      } else {
        await updateDoc(
          doc(FIREBASE_DB, "projects", projectId as string, "tasks", taskId),
          taskData
        );
      }
      closeModal();
    } catch (error) {
      console.error("Failed to save task:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <CustomModal isOpen={isOpen} onClose={closeModal}>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col h-full"
        >
          <div className="space-y-6 p-6 flex-1 overflow-y-auto scrollbar-hide">
            {/* Title */}
            <div>
              <Label className="block mb-2 font-medium">Task Title *</Label>
              <CustomFormField
                control={form.control}
                fieldType={FormFieldType.INPUT}
                name="title"
                placeholder="Enter title"
              />
            </div>

            {/* Description */}
            <div>
              <Label className="block mb-2 font-medium">Description</Label>
              <CustomFormField
                control={form.control}
                fieldType={FormFieldType.TEXTAREA}
                name="description"
                placeholder="Enter details"
              />
            </div>

            {/* Due Date */}
            <div>
              <Label className="block mb-2 font-medium">Due Date</Label>
              <DatePickerShadCN
                date={form.watch("dueDate")}
                setDate={(date) => {
                  const currentDate = form.getValues("dueDate");
                  if (date?.getTime() !== currentDate?.getTime()) {
                    form.setValue("dueDate", date);
                  }
                }}
              />
            </div>

            {/* Team Assignment */}
            <div>
              <Label className="block mb-3 font-medium">Team Assignment</Label>

              {/* Assigned Users */}
              {assignedUsers.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">
                      Currently Assigned ({assignedUsers.length})
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {assignedUsers.map((user) => (
                      <Badge
                        key={user.id}
                        variant="secondary"
                        className="flex items-center gap-2 py-1.5 px-3 rounded-full"
                      >
                        <Avatar className="h-5 w-5">
                          <AvatarImage />
                          <AvatarFallback>
                            {user.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span>{user.name}</span>
                        <button
                          type="button"
                          onClick={() => handleAssignUser(user, false)}
                          className="ml-1 rounded-full p-0.5 hover:bg-muted transition-colors"
                          aria-label={`Unassign ${user.name}`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Available Members */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">
                    Available Members
                  </span>
                </div>

                {availableMembers.length === 0 ? (
                  <div className="text-center py-6 border rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground">
                      {allProjectMembers.length === 0
                        ? "No team members available"
                        : "All team members are already assigned"}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[200px] overflow-y-auto p-1">
                    {availableMembers.map((user) => (
                      <div
                        key={user.id}
                        onClick={() => handleAssignUser(user, true)}
                        className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded-lg transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <Avatar className="h-8 w-8">
                            <AvatarImage />
                            <AvatarFallback>
                              {user.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.name}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons - Fixed at bottom */}
          <div className="sticky bottom-[-6] bg-black border-t p-4">
            <div className="flex justify-end gap-3">
              {taskId !== "new" && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={async () => {
                    if (confirm("Are you sure you want to delete this task?")) {
                      try {
                        await deleteDoc(
                          doc(
                            FIREBASE_DB,
                            "projects",
                            projectId as string,
                            "tasks",
                            taskId
                          )
                        );
                        closeModal();
                      } catch (error) {
                        console.error("Failed to delete task:", error);
                      }
                    }
                  }}
                  className="px-6"
                >
                  Delete Task
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                onClick={closeModal}
                className="px-6"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving} className="px-6">
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : taskId === "new" ? (
                  "Create Task"
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </CustomModal>
  );
};

export default TaskEditModal;
