"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import CustomModal from "@/components/ModalWrapper";
import {
  doc,
  updateDoc,
  deleteDoc,
  addDoc,
  collection,
  getDoc,
} from "firebase/firestore";
import { FIREBASE_DB } from "@/FirebaseConfig";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import DatePickerShadCN from "./DatePicker";
import { useSearchParams } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

interface TaskFormValues {
  title: string;
  description: string;
  dueDate: Date | undefined;
  stageId: string | null;
  assignedUsers: { id: string; name: string; email?: string }[];
}

interface ProjectMember {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
}

interface ProjectData {
  members?: ProjectMember[];
  admins?: ProjectMember[];
}

interface TaskEditModalProps {
  taskId: string;
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
  const projectId = searchParams.get("projectId");

  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [assignedUsers, setAssignedUsers] = useState<ProjectMember[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingProject, setIsLoadingProject] = useState(false);

  const convertDueDate = (d: string | Date | undefined) =>
    d ? (d instanceof Date ? d : new Date(d)) : undefined;

  const { register, handleSubmit, setValue, reset, watch } =
    useForm<TaskFormValues>();

  const allProjectMembers = useMemo(() => {
    if (!projectData) return [];

    // Handle all possible cases safely
    const admins =
      projectData.admins && Array.isArray(projectData.admins)
        ? projectData.admins
        : [];

    const members =
      projectData.members && Array.isArray(projectData.members)
        ? projectData.members
        : [];

    return [...admins, ...members];
  }, [projectData]);

  const availableMembers = useMemo(() => {
    // If no users are assigned, return all members
    if (assignedUsers.length === 0) return allProjectMembers;

    // Otherwise filter out assigned members
    return allProjectMembers.filter(
      (member) => !assignedUsers.some((assigned) => assigned.id === member.id)
    );
  }, [allProjectMembers, assignedUsers]);

  useEffect(() => {
    const fetchProjectData = async () => {
      if (!projectId) return;

      setIsLoadingProject(true);
      try {
        const projectDoc = await getDoc(
          doc(FIREBASE_DB, "projects", projectId)
        );
        if (projectDoc.exists()) {
          const data = projectDoc.data();
          setProjectData({
            members: Array.isArray(data.memberDetails)
              ? data.memberDetails
              : [],
            admins: Array.isArray(data.adminDetails) ? data.adminDetails : [],
          });
        }
      } catch (error) {
        console.error("Error fetching project data:", error);
        setProjectData({ members: [], admins: [] });
      } finally {
        setIsLoadingProject(false);
      }
    };

    if (isOpen) {
      fetchProjectData();
    }
  }, [projectId, isOpen]);

  useEffect(() => {
    if (isOpen) {
      const initialAssignedUsers = initialData?.assignedUsers || [];
      reset({
        title: initialData?.title || "",
        description: initialData?.description || "",
        dueDate: convertDueDate(initialData?.dueDate) || new Date(),
        stageId: initialData?.stageId || urlStageId || null,
        assignedUsers: initialAssignedUsers,
      });
      setAssignedUsers(initialAssignedUsers);
    }
  }, [isOpen, initialData, urlStageId, reset]);

  const closeModal = () => {
    onClose();
  };

  const handleAssignUser = (user: ProjectMember, isChecked: boolean) => {
    setAssignedUsers((prev) =>
      isChecked ? [...prev, user] : prev.filter((u) => u.id !== user.id)
    );
  };

  const onSubmit = async (data: TaskFormValues) => {
    setIsSaving(true);
    try {
      const taskData = {
        ...data,
        assignedUsers,
        dueDate: data.dueDate?.toISOString() || new Date().toISOString(),
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

  if (isLoadingProject) {
    return (
      <CustomModal isOpen={isOpen} onClose={closeModal}>
        <div className="flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </CustomModal>
    );
  }

  return (
    <CustomModal isOpen={isOpen} onClose={closeModal}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Title */}
        <div>
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            {...register("title", { required: "Title is required" })}
            placeholder="Enter task title"
          />
        </div>

        {/* Description */}
        <div>
          <Label htmlFor="description">Description</Label>
          <textarea
            id="description"
            {...register("description")}
            placeholder="Enter task description"
            className="w-full p-2 border rounded-md min-h-[100px]"
          />
        </div>

        {/* Due Date */}
        <div>
          <Label>Due Date</Label>
          <DatePickerShadCN
            date={watch("dueDate")}
            setDate={(date) => setValue("dueDate", date)}
          />
        </div>

        {/* Assigned Users */}
        <div>
          <Label>Assigned Team Members</Label>

          {/* Currently assigned users */}
          {assignedUsers.length > 0 && (
            <div className="mb-4">
              <div className="flex flex-wrap gap-2 mb-2">
                {assignedUsers.map((user) => (
                  <Badge
                    key={user.id}
                    variant="secondary"
                    className="flex items-center gap-2 py-1 px-3"
                  >
                    <Avatar className="h-5 w-5">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback>
                        {user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span>{user.name}</span>
                    <button
                      type="button"
                      onClick={() => handleAssignUser(user, false)}
                      className="ml-1 text-muted-foreground hover:text-foreground"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Available members to assign */}
          <div className="space-y-2 max-h-[200px] overflow-y-auto p-2 border rounded-md">
            {availableMembers.length === 0 && allProjectMembers.length > 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                {assignedUsers.length > 0
                  ? "All team members are already assigned"
                  : "No team members available to assign"}
              </p>
            ) : (
              availableMembers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded"
                >
                  <Checkbox
                    id={`assign-${user.id}`}
                    onCheckedChange={(checked) =>
                      handleAssignUser(user, !!checked)
                    }
                  />
                  <Label
                    htmlFor={`assign-${user.id}`}
                    className="flex items-center gap-2 flex-1"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback>
                        {user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      {user.email && (
                        <p className="text-sm text-muted-foreground">
                          {user.email}
                        </p>
                      )}
                    </div>
                  </Label>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-4">
          {taskId !== "new" && (
            <Button
              type="button"
              variant="destructive"
              onClick={async () => {
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
              }}
            >
              Delete Task
            </Button>
          )}
          <Button type="button" variant="outline" onClick={closeModal}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving}>
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
      </form>
    </CustomModal>
  );
};

export default TaskEditModal;
