"use client";

import React, { memo, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  collection,
  getDocs,
  arrayUnion,
} from "firebase/firestore";
import { Button } from "@/components/ui/button";
import CustomFormField from "@/components/CustomFormField";
import { Form } from "@/components/ui/form";
import { FormFieldType } from "@/components/forms/NewRegisterForm";
import { FIREBASE_DB } from "@/FirebaseConfig";
import DatePickerShadCN from "@/components/DatePicker";

interface User {
  id: string;
  name: string;
}

const ProjectForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const segments = pathname.split("/");
  const projectId = segments[segments.length - 1];
  const isEditMode = projectId !== "new";
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);

  const form = useForm({
    defaultValues: {
      title: "",
      description: "",
      category: "",
      status: "Ongoing",
      members: [],
      admins: [],
      stages: [],
      tasks: [],
      dueDate: undefined,
    },
  });

  useEffect(() => {
    if (isEditMode) {
      const fetchProject = async () => {
        setLoading(true);
        console.log("projectId", projectId);
        const docRef = doc(FIREBASE_DB, "projects", projectId!);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          form.reset(docSnap.data());
        }
        setLoading(false);
      };
      fetchProject();
    }
  }, [isEditMode, projectId, form]);

  useEffect(() => {
    const fetchUsers = async () => {
      const usersRef = collection(FIREBASE_DB, "users");
      const usersSnap = await getDocs(usersRef);
      const usersList: User[] = usersSnap.docs.map((doc) => ({
        ...(doc.data() as User),
        id: doc.id,
      }));
      setUsers(usersList);
    };
    fetchUsers();
  }, []);

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      let projectRef;
      if (isEditMode) {
        projectRef = doc(FIREBASE_DB, "projects", projectId!);
        await updateDoc(projectRef, data);
      } else {
        const projectId = `${data.title
          .replace(/\s+/g, "-")
          .toLowerCase()}-${Date.now()}`;
        projectRef = doc(FIREBASE_DB, "projects", projectId);
        await setDoc(projectRef, { ...data, createdAt: serverTimestamp() });
      }

      const updateUserProjects = async (userIds: string[]) => {
        const batchUpdates = userIds.map(async (userId) => {
          const userRef = doc(FIREBASE_DB, "users", userId);
          return updateDoc(userRef, {
            projects: arrayUnion(projectRef.id),
          });
        });
        await Promise.all(batchUpdates);
      };

      await updateUserProjects(data.members);
      await updateUserProjects(data.admins);
    } catch (error) {
      console.error("Error saving project:", error);
    } finally {
      setLoading(false);
      router.push("/dashboard/projects");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-dark-400 rounded-lg">
      <h1 className="text-xl font-bold mb-4">
        {isEditMode ? "Edit Project" : "Add New Project"}
      </h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <CustomFormField
            control={form.control}
            fieldType={FormFieldType.INPUT}
            name="title"
            label="Project Title"
            placeholder="Enter project title"
          />
          <CustomFormField
            control={form.control}
            fieldType={FormFieldType.TEXTAREA}
            name="description"
            label="Description"
            placeholder="Enter project details"
          />
          <div className="flex flex-col">
            <label htmlFor="dueDate" className="text-sm font-semibold mb-2">
              Due Date
            </label>
            <DatePickerShadCN
              date={form.watch("dueDate")}
              setDate={(date: any) => form.setValue("dueDate", date)}
            />
          </div>
          <CustomFormField
            control={form.control}
            fieldType={FormFieldType.SEARCHABLE_SELECT}
            allowNewOptions={false}
            name="category"
            label="Category"
            placeholder="Select category"
            options={["Research", "Major", "Minor", "Other"]}
          />
          <CustomFormField
            control={form.control}
            fieldType={FormFieldType.M_SEARCHABLE_SELECT}
            allowNewOptions={false}
            name="members"
            label="Add members to the project"
            placeholder="Select multiple members"
            options={users.map((user) => user.id)}
          />
          <CustomFormField
            control={form.control}
            fieldType={FormFieldType.M_SEARCHABLE_SELECT}
            allowNewOptions={false}
            name="admins"
            label="Add admins to the project"
            placeholder="Select multiple admins"
            options={users.map((user) => user.id)}
          />
          <CustomFormField
            control={form.control}
            fieldType={FormFieldType.M_SEARCHABLE_SELECT}
            name="stages"
            label="Add stages to the project"
            placeholder="Select multiple stages"
            options={[
              "unassigned",
              "To do",
              "In progress",
              "In Review",
              "Completed",
            ]}
          />
          <CustomFormField
            control={form.control}
            fieldType={FormFieldType.M_SEARCHABLE_SELECT}
            name="tasks"
            label="Add tasks to the project"
            placeholder="Select multiple tasks"
            options={[
              "unassigned",
              "To do",
              "In progress",
              "In Review",
              "Completed",
            ]}
          />
          <Button type="submit" disabled={loading} className="w-full">
            {loading
              ? "Saving..."
              : isEditMode
              ? "Update Project"
              : "Create Project"}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default ProjectForm;
