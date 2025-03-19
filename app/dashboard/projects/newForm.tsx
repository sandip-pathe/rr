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
import { FormFieldType } from "@/enum/FormFieldTypes";
import { FIREBASE_DB } from "@/FirebaseConfig";
import DatePickerShadCN from "@/components/DatePicker";
import Layout from "@/components/Layout";
import { IoClose } from "react-icons/io5";
import Spiner from "@/components/Spiner";

interface User {
  id: string;
  name: string;
}

const ProjectForm = ({ onClick }: any) => {
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId");
  const isNew = projectId == "new";
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
      memberDetails: {},
      adminDetails: {},
      dueDate: undefined,
      createTasksWithAI: true,
    },
  });

  useEffect(() => {
    console.log("projectId", projectId);
    if (!projectId || projectId === "new") return;

    const fetchProject = async () => {
      setLoading(true);
      try {
        const docRef = doc(FIREBASE_DB, "projects", projectId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          form.reset(docSnap.data());
        } else {
          console.warn("Project not found");
        }
      } catch (error) {
        console.error("Error fetching project:", error);
      }
      setLoading(false);
    };

    fetchProject();
  }, [projectId, form]);

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
      const newProjectId = !isNew
        ? projectId
        : `${data.title.replace(/\s+/g, "-").toLowerCase()}-${Date.now()}`;

      projectRef = doc(FIREBASE_DB, "projects", newProjectId!);

      // Convert users array to ID → Name mappings
      const memberDetails = data.members.reduce((acc: any, userId: string) => {
        const user = users.find((u) => u.id === userId);
        if (user) acc[userId] = user.name;
        return acc;
      }, {});

      const adminDetails = data.admins.reduce((acc: any, userId: string) => {
        const user = users.find((u) => u.id === userId);
        if (user) acc[userId] = user.name;
        return acc;
      }, {});

      const projectData = {
        ...data,
        members: Object.keys(memberDetails),
        admins: Object.keys(adminDetails),
        memberDetails,
        adminDetails,
        createdAt: !isNew ? undefined : serverTimestamp(),
      };

      if (!isNew) {
        await updateDoc(projectRef, projectData);
      } else {
        await setDoc(projectRef, projectData);
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

      await updateUserProjects(Object.keys(memberDetails));
      await updateUserProjects(Object.keys(adminDetails));

      if (data.createTasksWithAI) {
        console.log("✅ Creating tasks using AI for the project...");
        await generateAITasks(projectRef.id, data.title);
      }
    } catch (error) {
      console.error("Error saving project:", error);
    } finally {
      setLoading(false);
      closeModal();
    }
  };

  const generateAITasks = async (projectId: string, title: string) => {
    console.log(
      `Generating AI tasks for Project ID: ${projectId}, Title: ${title}`
    );
  };

  const closeModal = () => {
    const params = new URLSearchParams(window.location.search);
    params.delete("projectId");
    const newUrl = `${window.location.pathname}${
      params.toString() ? "?" + params.toString() : ""
    }`;
    window.history.replaceState(null, "", newUrl);
    onClick();
  };

  return (
    <>
      <div className="space-y-6 flex-1 bg-black p-8 pb-0 scroll-auto">
        <section className="mb-10 space-y-4">
          <span className="relative flex justify-end">
            <button
              type="button"
              className="text-white text-xl font-semibold"
              onClick={closeModal}
            >
              <IoClose />
            </button>
          </span>
          {loading ? (
            <Spiner />
          ) : (
            <h1 className="text-xl font-bold mb-4">
              {!isNew ? "Edit Project" : "Add New Project"}
            </h1>
          )}
        </section>

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
              name="admins"
              label="Add admins to the project"
              placeholder="Select multiple admins"
              options={users}
              optionKey="id"
              optionLabel="name"
            />
            <CustomFormField
              control={form.control}
              fieldType={FormFieldType.M_SEARCHABLE_SELECT}
              allowNewOptions={false}
              name="members"
              label="Add members to the project"
              placeholder="Select multiple members"
              options={users}
              optionKey="id"
              optionLabel="name"
            />
            {isNew && (
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="createTasksWithAI"
                  {...form.register("createTasksWithAI")}
                  defaultChecked={true}
                  className="w-4 h-4"
                />
                <label htmlFor="createTasksWithAI" className="text-sm">
                  Create tasks for the project using AI?
                </label>
              </div>
            )}
            <Button type="submit" disabled={loading} className="w-full">
              {loading
                ? "Saving..."
                : !isNew
                ? "Update Project"
                : "Create Project"}
            </Button>
          </form>
        </Form>
      </div>
    </>
  );
};

export default ProjectForm;
