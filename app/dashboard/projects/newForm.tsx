"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
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
  addDoc,
} from "firebase/firestore";
import { Button } from "@/components/ui/button";
import CustomFormField from "@/components/CustomFormField";
import { Form } from "@/components/ui/form";
import { FIREBASE_DB } from "@/FirebaseConfig";
import DatePickerShadCN from "@/components/DatePicker";
import { IoClose } from "react-icons/io5";
import Spiner from "@/components/Spiner";
import { generateAITasks } from "./helper";
import { FaDeleteLeft } from "react-icons/fa6";
import { FormFieldType } from "@/enum/FormFieldTypes";
import { addProjectNotification } from "../activity/AddNotification";
import { useAuth } from "@/app/auth/AuthContext";

interface User {
  id: string;
  name: string;
}

interface FormValues {
  title: string;
  description: string;
  category: string;
  status: string;
  tasks: any[];
  taskCount: number;
  skills: string[];
  members: string[];
  admins: string[];
  memberDetails: Record<string, string>;
  adminDetails: Record<string, string>;
  dueDate: Date | undefined;
  createTasksWithAI: boolean;
}

export interface ProjectDetails {
  title: string;
  description: string;
  category: string;
  existingSkills: string[];
  dueDate?: Date | undefined;
}

const skills = [
  "React",
  "Vue",
  "Angular",
  "Node",
  "Express",
  "MongoDB",
  "Firebase",
  "PostgreSQL",
  "GraphQL",
  "REST API",
  "TypeScript",
  "JavaScript",
  "HTML",
  "CSS",
  "SASS",
  "Tailwind CSS",
  "Bootstrap",
  "Material UI",
];

const ProjectForm = ({ onClick }: any) => {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId");
  const isNew = projectId == "new";
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [taskCount, setTaskCount] = useState("3");
  const [tasks, setTasks] = useState<any[]>([]);
  const [reasoning, setReasoning] = useState("");
  const [hasGeneratedSuggestions, setHasGeneratedSuggestions] = useState(false);
  const [isPublic, setIsPublic] = useState(false);

  const form = useForm<FormValues>({
    defaultValues: {
      title: "",
      description: "",
      category: "",
      status: "Ongoing",
      tasks: [],
      taskCount: 0,
      skills: [],
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

  const generateProjectId = (title: string) => {
    const sanitizedTitle = title.replace(/\s+/g, "").toLowerCase().slice(0, 15);
    const dateSuffix = new Date()
      .toISOString()
      .replace(/[-:T.]/g, "")
      .slice(-5);
    return `${sanitizedTitle.padEnd(15, "-")}${dateSuffix}`;
  };

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      let projectRef;
      const newProjectId = !isNew ? projectId : generateProjectId(data.title);
      projectRef = doc(FIREBASE_DB, "projects", newProjectId!);

      // Prepare member and admin details
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
        isPublic,
        createdAt: !isNew ? undefined : serverTimestamp(),
      };

      // Save project data
      if (!isNew) {
        await updateDoc(projectRef, projectData);
      } else {
        await setDoc(projectRef, projectData);
      }

      // Update user projects
      const updateUserProjects = async (userIds: string[]) => {
        const batchUpdates = userIds.map(async (userId) => {
          const userRef = doc(FIREBASE_DB, "users", userId);
          return updateDoc(userRef, {
            projects: arrayUnion(projectRef.id),
          });
        });
        await Promise.all(batchUpdates);
      };

      // Get all assigned users (members + admins) excluding current user
      const allAssignedUsers = [
        ...Object.keys(memberDetails),
        ...Object.keys(adminDetails),
      ].filter((id) => id !== user?.uid);

      // Update projects for all assigned users
      await updateUserProjects(allAssignedUsers);

      // Send notifications to all assigned users
      const notificationPromises = allAssignedUsers.map((userId) =>
        addProjectNotification(
          userId,
          data.title,
          newProjectId!,
          !isNew ? "Project updated" : "You've been added to a new project"
        )
      );

      await Promise.all(notificationPromises);

      console.log("✅ Project saved successfully");
      await handleSubmitTasks(newProjectId as string);
      console.log("✅ Tasks saved successfully");
      closeModal();
    } catch (error) {
      console.error("Error saving project:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateTasks = async (isRegenerate = false) => {
    if (
      isRegenerate &&
      !confirm("Regenerate tasks? This will replace current tasks.")
    ) {
      return;
    }
    setIsLoading(true);
    const taskCountNum = parseInt(taskCount, 10);
    if (isNaN(taskCountNum) || taskCountNum <= 0) {
      alert("Please enter a valid number of tasks.");
      return;
    }
    if (isRegenerate) {
      setTasks([]);
      setReasoning("");
    }
    try {
      const formValues = form.getValues();
      const projectDetails: ProjectDetails = {
        title: formValues.title,
        description: formValues.description,
        category: formValues.category,
        existingSkills: formValues.skills || [],
        dueDate: formValues.dueDate,
      };

      const aiSuggestions = await generateAITasks(projectDetails, taskCountNum);

      // Update tasks
      const tasksWithIds = aiSuggestions.tasks.map((task) => ({
        ...task,
        id: crypto.randomUUID(),
        dueDate: new Date(task.dueDate),
        stageId: "1-unassigned",
      }));

      setTasks(tasksWithIds);
      setReasoning(aiSuggestions.reasoning);

      // Rest of your handling remains the same
      form.setValue("skills", [
        ...formValues.skills,
        ...aiSuggestions.suggestedSkills,
      ]);

      // Update due date if not set
      if (!formValues.dueDate && aiSuggestions.recommendedDeadline) {
        form.setValue("dueDate", new Date(aiSuggestions.recommendedDeadline));
      }

      console.log("✅ AI suggestions applied:", aiSuggestions);
    } catch (error) {
      console.error("❌ Failed to generate AI suggestions:", error);
    } finally {
      setIsLoading(false);
    }
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

  const handleEditTask = (
    id: string,
    field: "title" | "description" | "dueDate",
    value: string | Date
  ) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === id
          ? { ...task, [field]: field === "dueDate" ? new Date(value) : value }
          : task
      )
    );
  };

  const handleDeleteTask = (id: string) => {
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id));
  };

  const handleSubmitTasks = async (projectIdx: string) => {
    setLoading(true);

    try {
      const tasksCollectionRef = collection(
        FIREBASE_DB,
        "projects",
        projectIdx,
        "tasks"
      );

      const validTasks = tasks.filter(
        (task) => task.title.trim() || task.description.trim()
      );

      await Promise.all(
        validTasks.map(async (task) =>
          addDoc(tasksCollectionRef, {
            title: task.title,
            description: task.description,
            dueDate: task.dueDate
              ? task.dueDate.toISOString()
              : new Date().toISOString(),
            stageId: "1-unassigned",
          })
        )
      );

      console.log("✅ Tasks successfully uploaded.");
    } catch (error) {
      console.error("❌ Error uploading tasks:", error);
    } finally {
      setLoading(false);
    }
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
              options={[
                "Research Project",
                "Major Project",
                "Mini Project",
                "Other",
              ]}
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
              name="skills"
              label="Add skills, tools, or qualifications required"
              placeholder="Select skills or tools"
              optionKey="id"
              options={skills}
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
              <>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="public-comment"
                    checked={isPublic}
                    onChange={() => setIsPublic(!isPublic)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="public-comment">Mark Public</label>
                  <span className="text-sm text-gray-500">
                    Anyone with the link can view this project, request to join
                  </span>
                </div>
                <div className="flex items-center space-x-4 mb-4">
                  <input
                    type="number"
                    value={taskCount}
                    onChange={(e) => setTaskCount(e.target.value)}
                    className="w-16 p-2 border rounded-md"
                    min="2"
                    max="50"
                    placeholder="2-50"
                  />
                  <Button
                    type="button"
                    onClick={() => {
                      handleGenerateTasks(hasGeneratedSuggestions);
                      setHasGeneratedSuggestions(true);
                    }}
                    disabled={isLoading}
                    variant={hasGeneratedSuggestions ? "outline" : "default"}
                  >
                    {isLoading
                      ? "Generating..."
                      : hasGeneratedSuggestions
                      ? "Regenerate Tasks"
                      : "Generate AI Tasks"}
                  </Button>
                </div>
              </>
            )}

            {tasks.length > 0 && (
              <>
                {reasoning && (
                  <div className="text-sm text-gray-400 mb-2 p-2 bg-gray-800 rounded">
                    <strong>AI Reasoning:</strong> {reasoning}
                  </div>
                )}
                <h3 className="font-bold mb-2">Project Tasks</h3>
                <table className="w-full border-collapse border border-gray-700 rounded-sm">
                  <thead>
                    <tr className="bg-gray-800 text-white">
                      <th className="p-2 border border-gray-700">Title</th>
                      <th className="p-2 border border-gray-700">
                        Description
                      </th>
                      <th className="p-2 border border-gray-700">Due Date</th>
                      <th className="p-2 border border-gray-700">X</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.map((task) => (
                      <tr key={task.id}>
                        <td className="p-2 border-y border-gray-700">
                          <input
                            className="bg-transparent w-full p-1 border rounded-md"
                            type="text"
                            value={task.title}
                            onChange={(e) =>
                              handleEditTask(task.id, "title", e.target.value)
                            }
                          />
                        </td>
                        <td className="p-2 border-y border-gray-700">
                          <input
                            className="bg-transparent w-full p-1 border rounded-md"
                            type="text"
                            value={task.description}
                            onChange={(e) =>
                              handleEditTask(
                                task.id,
                                "description",
                                e.target.value
                              )
                            }
                          />
                        </td>
                        <td className="p-2 border-y border-gray-700 max-w-28 align-middle">
                          <DatePickerShadCN
                            date={task.dueDate}
                            setDate={(date: any) =>
                              handleEditTask(task.id, "dueDate", date)
                            }
                          />
                        </td>
                        <td className="p-2 border-y border-gray-700 cursor-pointer">
                          <div onClick={() => handleDeleteTask(task.id)}>
                            <FaDeleteLeft className="text-3xl" />
                          </div>
                        </td>
                      </tr>
                    ))}
                    {/* an empty row */}
                    <tr>
                      <td className="p-2 border-y border-gray-700">
                        <input
                          className="bg-transparent w-full p-1 border rounded-md"
                          type="text"
                          value=""
                          placeholder="New task title"
                          onChange={(e) =>
                            setTasks([
                              ...tasks,
                              {
                                id: crypto.randomUUID(),
                                title: e.target.value,
                                description: "",
                                dueDate: new Date(),
                              },
                            ])
                          }
                        />
                      </td>
                      <td className="p-2 border-y border-gray-700">
                        <input
                          className="bg-transparent w-full p-1 border rounded-md"
                          type="text"
                          value=""
                          placeholder="New task description"
                          onChange={(e) =>
                            setTasks([
                              ...tasks,
                              {
                                id: crypto.randomUUID(),
                                title: "",
                                description: e.target.value,
                                dueDate: new Date(),
                              },
                            ])
                          }
                        />
                      </td>
                      <td className="p-2 border-y border-gray-700 max-w-28 align-middle">
                        <DatePickerShadCN
                          date={new Date()}
                          setDate={(date: any) =>
                            setTasks([
                              ...tasks,
                              {
                                id: crypto.randomUUID(),
                                title: "",
                                description: "",
                                dueDate: date,
                              },
                            ])
                          }
                        />
                      </td>
                      <td></td>
                    </tr>
                  </tbody>
                </table>
              </>
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
