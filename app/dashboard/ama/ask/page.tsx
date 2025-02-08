"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form } from "@/components/ui/form";
import SubmitButton from "@/components/SubmitButton";
import CustomFormField from "@/components/CustomFormField";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AMAAskFormValidation } from "@/lib/Validation";
import MdEditorComponent from "./Md";
import Layout from "@/components/Layout";
import { addDoc, collection, Timestamp } from "firebase/firestore";
import { useDropzone } from "react-dropzone";
import { zodResolver } from "@hookform/resolvers/zod";
import { FIREBASE_DB } from "@/FirebaseConfig";
import { useAuth } from "@/app/auth/AuthContext";

export enum FormFieldType {
  INPUT = "input",
  TEXTAREA = "textarea",
}

const AskQuestionsPage = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [markdownContent, setMarkdownContent] = useState("");
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const { user, name, loading } = useAuth();

  const form = useForm<z.infer<typeof AMAAskFormValidation>>({
    resolver: zodResolver(AMAAskFormValidation),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  const handleValueChange = (value: string) => {
    setMarkdownContent(value);
  };

  const onDrop = (acceptedFiles: File[]) => {
    setUploadedImages((prevImages) => [...prevImages, ...acceptedFiles]);
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    multiple: true,
  });

  async function onSubmit({ title }: z.infer<typeof AMAAskFormValidation>) {
    setIsLoading(true);
    setError(null);
    try {
      const imageUrls = "NoURL";
      const postData = {
        title,
        description: markdownContent,
        images: imageUrls,
        authorId: user?.uid,
        authorName: name,
        created_at: Timestamp.now(),
      };

      await addDoc(collection(FIREBASE_DB, "ama"), postData);
      router.push("/dashboard/ama");
    } catch (error) {
      console.error(error);
      setError("Failed to submit the post.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Layout>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6 flex-1 w-2/3 ml-24 my-3"
        >
          <section className="space-y-4">
            <h1 className="font-bold text-2xl text-gray-500">Create Post</h1>
          </section>
          {error && <p className="text-red-600">{error}</p>}
          <CustomFormField
            fieldType={FormFieldType.INPUT}
            name="title"
            label="Title"
            placeholder="Title"
            control={form.control}
          />
          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium text-gray-200">
              Description (Markdown Supported)
            </label>
            <MdEditorComponent onChange={handleValueChange} />
          </div>

          {/* Image Upload
          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium text-gray-200">
              Upload Images
            </label>
            <div
              {...getRootProps({
                className:
                  "border-2 border-dashed border-gray-600 p-4 rounded-md text-center cursor-pointer",
              })}
            >
              <input {...getInputProps()} />
              <p>Drag 'n' drop some files here, or click to select files</p>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {uploadedImages.map((file, idx) => (
                <img
                  key={idx}
                  src={URL.createObjectURL(file)}
                  alt="preview"
                  className="w-20 h-20 object-cover rounded-md"
                />
              ))}
            </div>
          </div> */}

          <div className="gap-5 justify-end flex">
            <SubmitButton isLoading={isLoading}>Submit</SubmitButton>
          </div>
        </form>
      </Form>
    </Layout>
  );
};

export default AskQuestionsPage;
