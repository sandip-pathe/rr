"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form } from "@/components/ui/form";
import SubmitButton from "@/components/SubmitButton";
import CustomFormField from "@/components/CustomFormField";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { addDoc, collection, Timestamp } from "firebase/firestore";
import { useDropzone } from "react-dropzone";
import { zodResolver } from "@hookform/resolvers/zod";
import { FIREBASE_DB } from "@/FirebaseConfig";
import { useAuth } from "@/app/auth/AuthContext";
import { IoClose } from "react-icons/io5";
import { FiUpload } from "react-icons/fi";
import { Switch } from "@headlessui/react";
import Image from "next/image";
import { FormFieldType } from "@/enum/FormFieldTypes";
import { AMAAskFormValidation } from "@/lib/Validation";

const AskQuestionsPage = ({ onClick }: { onClick: () => void }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("write");
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const { user, name, loading } = useAuth();

  const form = useForm<z.infer<typeof AMAAskFormValidation>>({
    resolver: zodResolver(AMAAskFormValidation),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles?.length) {
      setUploadedImages((prevImages) => [
        ...prevImages,
        ...acceptedFiles.slice(0, 3 - prevImages.length), // Limit to 3 images
      ]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif"],
    },
    maxFiles: 3,
    maxSize: 5 * 1024 * 1024, // 5MB
  });

  const removeImage = (index: number) => {
    setUploadedImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };

  async function onSubmit({ title }: z.infer<typeof AMAAskFormValidation>) {
    setIsLoading(true);
    try {
      const imageUrls = uploadedImages.length > 0 ? "Uploaded" : "None";

      const postData = {
        title,
        description: form.getValues("description"),
        images: imageUrls,
        authorId: isAnonymous ? null : user?.uid,
        authorName: isAnonymous ? "Anonymous" : name,
        created_at: Timestamp.now(),
        isAnonymous,
        tags: [],
        status: "pending",
      };

      await addDoc(collection(FIREBASE_DB, "ama"), postData);
      router.refresh();
      onClick();
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Ask a Question</h2>
          <button
            type="button"
            onClick={onClick}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <IoClose size={24} />
          </button>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          <CustomFormField
            fieldType={FormFieldType.INPUT}
            name="title"
            label="Question Title"
            placeholder="What would you like to ask?"
            control={form.control}
          />
          <CustomFormField
            fieldType={FormFieldType.TEXTAREA}
            name="description"
            label="Description"
            placeholder="Provide more details about your question"
            control={form.control}
          />

          {/* Image Upload */}
          <div className="space-y-2">
            <label>Add Images (Optional)</label>
            <p className="text-sm text-gray-400 mb-2">
              You can upload up to 3 images (max 5MB each)
            </p>
            <div
              {...getRootProps({
                className: `border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                  isDragActive
                    ? "border-blue-500 bg-blue-500/10"
                    : "border-gray-700 hover:border-gray-600"
                }`,
              })}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center justify-center gap-2">
                <FiUpload size={24} className="text-gray-400" />
                <p className="text-sm text-gray-300">
                  {isDragActive
                    ? "Drop the files here"
                    : "Drag & drop images here, or click to select"}
                </p>
                <p className="text-xs text-gray-500">Supports JPG, PNG, GIF</p>
              </div>
            </div>

            {/* Image Previews */}
            {uploadedImages.length > 0 && (
              <div className="mt-4">
                <div className="flex flex-wrap gap-3">
                  {uploadedImages.map((file, idx) => (
                    <div key={idx} className="relative group">
                      <Image
                        src={URL.createObjectURL(file)}
                        alt={`Preview ${idx + 1}`}
                        className="w-24 h-24 object-cover rounded-md border border-gray-700"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeImage(idx);
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <IoClose size={14} className="text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Additional Options */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center space-x-2">
              <Switch
                id="anonymous-mode"
                checked={isAnonymous}
                onChange={setIsAnonymous}
              />
              <label htmlFor="anonymous-mode">Post Anonymously</label>
            </div>

            <div className="text-sm text-gray-400">
              {uploadedImages.length}/3 images
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 pt-6">
          <button
            type="button"
            onClick={onClick}
            className="px-4 py-2 rounded-md border border-gray-700 text-gray-300 hover:bg-gray-800 transition-colors"
            disabled={isLoading}
          >
            Cancel
          </button>
          <SubmitButton isLoading={isLoading} className="px-4 py-2">
            Post Question
          </SubmitButton>
        </div>
      </form>
    </Form>
  );
};

export default AskQuestionsPage;
