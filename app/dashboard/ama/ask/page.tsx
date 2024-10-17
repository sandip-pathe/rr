"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form } from "@/components/ui/form";
import SubmitButton from "@/components/SubmitButton";
import CustomFormField from "@/components/CustomFormField";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AMAAskFormValidation } from "@/lib/Validation";
import MarkdownEditor from "react-markdown-editor-lite";
import "react-markdown-editor-lite/lib/index.css"; // Import editor styles
import { useDropzone } from "react-dropzone";
import { HtmlType } from "react-markdown-editor-lite/cjs/editor/preview";
import MdEditorComponent from "./Md";
import Layout from "@/components/Layout";

export enum FormFieldType {
  INPUT = "input",
  TEXTAREA = "textarea",
}

const AskQuestionsPage = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null); // For error handling
  const [markdownContent, setMarkdownContent] = useState(""); // Markdown content state
  const [uploadedImages, setUploadedImages] = useState<File[]>([]); // State for uploaded images

  const form = useForm<z.infer<typeof AMAAskFormValidation>>({
    resolver: zodResolver(AMAAskFormValidation),
    defaultValues: {
      question: "",
      description: "",
    },
  });

  // Handle Markdown editor changes
  const handleEditorChange = ({ text }: any) => {
    setMarkdownContent(text);
  };

  // Image upload using react-dropzone
  const onDrop = (acceptedFiles: File[]) => {
    setUploadedImages((prevImages) => [...prevImages, ...acceptedFiles]);
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    multiple: true,
  });

  async function onSubmit({
    question,
    description,
  }: z.infer<typeof AMAAskFormValidation>) {
    setIsLoading(true);
    setError(null);
    try {
      const postData = {
        question,
        description: markdownContent, // Save Markdown content in description
        images: uploadedImages, // You will need to handle image uploads here
      };

      // Add your submission logic here
      console.log(postData);
    } catch (error) {
      console.log(error);
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
          className="space-y-6 flex-1 w-2/3 items-center justify-center ml-24 my-3"
        >
          <section className="space-y-4">
            <h1 className="font-bold text-2xl text-gray-500">Create Post</h1>
          </section>
          {error && <p className="text-red-600">{error}</p>}{" "}
          {/* Display error message if submission fails */}
          <CustomFormField
            fieldType={FormFieldType.INPUT}
            name="question"
            label="Title"
            placeholder="Title"
            control={form.control}
          />
          <div className="mb-4">
            <label
              htmlFor="markdown-content"
              className="block mb-2 text-sm font-medium text-gray-200"
            >
              Description (Markdown Supported)
            </label>
            <MdEditorComponent />
          </div>
          {/* Image Upload */}
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
          </div>
          <div className="gap-5 justify-end w-auto flex flex-row">
            <SubmitButton isLoading={isLoading}>Submit</SubmitButton>
            <SubmitButton isLoading={isLoading}>Draft</SubmitButton>
          </div>
        </form>
      </Form>
    </Layout>
  );
};

export default AskQuestionsPage;
