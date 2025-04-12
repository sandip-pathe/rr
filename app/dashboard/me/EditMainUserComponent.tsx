"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { FIREBASE_DB } from "@/FirebaseConfig";
import { Form } from "@/components/ui/form";
import CustomFormField from "@/components/CustomFormField";
import SubmitButton from "@/components/SubmitButton";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useAuth } from "@/app/auth/AuthContext";
import { IoClose } from "react-icons/io5";
import { FormFieldType } from "@/enum/FormFieldTypes";

interface EditUserFormData {
  name: string;
  introduction: string;
  degree: string;
  website: string;
  institution: string;
  department: string;
  position: string;
  location: string;
}

// Degree options list
const degreeOptions = [
  "Bachelor of Science",
  "Bachelor of Arts",
  "Bachelor of Engineering",
  "Master of Science",
  "Master of Business Administration",
  "Doctor of Philosophy",
];

interface Props {
  onClose: () => void;
}

const EditMainUserComponent = ({ onClose }: React.PropsWithChildren<Props>) => {
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // React Hook Form with TypeScript integration
  const form = useForm<EditUserFormData>({
    defaultValues: {
      name: "",
      introduction: "",
      degree: "",
      website: "",
      institution: "",
      department: "",
      position: "",
      location: "",
    },
  });

  useEffect(() => {
    if (!user?.uid) return;

    const fetchUserData = async () => {
      try {
        const userRef = doc(FIREBASE_DB, "users", user.uid);
        const docSnap = await getDoc(userRef);

        if (docSnap.exists()) {
          const userData = docSnap.data() as Partial<EditUserFormData>;

          form.reset({
            name: userData.name || "",
            introduction: userData.introduction || "",
            degree: userData.degree || "",
            website: userData.website || "",
            institution: userData.institution || "",
            department: userData.department || "",
            position: userData.position || "",
            location: userData.location || "",
          });
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [user?.uid, form]);

  // Submit function with TypeScript type enforcement
  const onSubmit: SubmitHandler<EditUserFormData> = async (data) => {
    if (!user?.uid) return;

    setIsLoading(true);
    try {
      const userRef = doc(FIREBASE_DB, "users", user.uid);
      await updateDoc(userRef, { ...data });

      onClose();
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 flex-1 bg-black p-8 pb-0 scroll-auto"
      >
        <section className="mb-10 space-y-4">
          <span className="relative flex justify-end">
            <button
              type="button"
              className="text-white text-xl font-semibold"
              onClick={onClose}
            >
              <IoClose />
            </button>
          </span>
          <h1 className="header">Edit Profile Details</h1>
        </section>

        <div>
          <h3 className="mb-2 font-semibold">Status/Activity</h3>
          <CustomFormField
            control={form.control}
            fieldType={FormFieldType.TEXTAREA}
            name="introduction"
            placeholder="Looking for collaborators, a new position, feedback, or something else?"
          />
        </div>

        <div>
          <h3 className="my-2 font-semibold">Position</h3>
          <CustomFormField
            control={form.control}
            fieldType={FormFieldType.INPUT}
            name="position"
          />
        </div>

        <div>
          <h3 className="mb-2 font-semibold">Personal Website</h3>
          <CustomFormField
            control={form.control}
            name="website"
            fieldType={FormFieldType.INPUT}
            placeholder="Add link to your website"
          />
        </div>

        <Collapsible>
          <CollapsibleTrigger className="text-sm text-blue-400 flex items-center">
            Edit name and other details ▼
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div>
              <h3 className="my-2 font-semibold">Name</h3>
              <CustomFormField
                control={form.control}
                fieldType={FormFieldType.INPUT}
                placeholder="Enter your full name"
                name="name"
              />
            </div>
            <div>
              <h3 className="my-2 font-semibold">Institution</h3>
              <CustomFormField
                control={form.control}
                fieldType={FormFieldType.INPUT}
                name="institution"
              />
            </div>
            <div>
              <h3 className="my-2 font-semibold">Department</h3>
              <CustomFormField
                control={form.control}
                fieldType={FormFieldType.SEARCHABLE_SELECT}
                name="department"
                options={degreeOptions}
              />
            </div>
            <div>
              <h3 className="mb-2 font-semibold">Degree</h3>
              <CustomFormField
                control={form.control}
                fieldType={FormFieldType.SEARCHABLE_SELECT}
                name="degree"
                placeholder="Enter or select your degree"
                options={degreeOptions}
              />
            </div>
            <div>
              <h3 className="my-2 font-semibold">Location</h3>
              <CustomFormField
                control={form.control}
                fieldType={FormFieldType.INPUT}
                name="location"
              />
            </div>
          </CollapsibleContent>
        </Collapsible>

        <div className="flex flex-wrap gap-5">
          <SubmitButton
            className="w-fit p-4 rounded-none"
            isLoading={isLoading}
          >
            Save Changes
          </SubmitButton>
        </div>
      </form>
    </Form>
  );
};

export default EditMainUserComponent;
