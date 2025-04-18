"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form } from "@/components/ui/form";
import SubmitButton from "@/components/SubmitButton";
import CustomFormField from "@/components/CustomFormField";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { addDoc, collection, Timestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useDropzone } from "react-dropzone";
import { zodResolver } from "@hookform/resolvers/zod";
import { FIREBASE_DB, FIREBASE_STORAGE } from "@/FirebaseConfig";
import { useAuth } from "@/app/auth/AuthContext";
import { IoClose } from "react-icons/io5";
import { FiUpload } from "react-icons/fi";
import { Switch } from "@headlessui/react";
import Image from "next/image";
import { FormFieldType } from "@/enum/FormFieldTypes";
import { AMAAskFormValidation } from "@/lib/Validation";
import { useToast } from "@/hooks/use-toast";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_FILES = 3;

const AskQuestionsPage = ({ onClick }: { onClick: () => void }) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const { user, name } = useAuth();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof AMAAskFormValidation>>({
    resolver: zodResolver(AMAAskFormValidation),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    if (rejectedFiles.length > 0) {
      const firstRejection = rejectedFiles[0];
      if (firstRejection.errors[0].code === "file-too-large") {
        toast({
          variant: "destructive",
          title: "File is too large.",
          description: `Maximum file size is ${
            MAX_FILE_SIZE / (1024 * 1024)
          }MB.`,
        });
      } else {
        toast({
          variant: "destructive",
          description: `Invalid file type. Only images are allowed.`,
        });
      }
      return;
    }

    const validFiles = acceptedFiles.filter(
      (file) => file.size <= MAX_FILE_SIZE
    );

    if (validFiles.length > 0) {
      setUploadedImages((prevImages) => {
        const remainingSlots = MAX_FILES - prevImages.length;
        if (remainingSlots <= 0) {
          toast({
            variant: "destructive",
            title: "File is too large.",
            description: `Maximum file size is ${
              MAX_FILE_SIZE / (1024 * 1024)
            }MB.`,
          });
          return prevImages;
        }
        const newFiles = validFiles.slice(0, remainingSlots);
        if (newFiles.length < validFiles.length) {
          toast({
            variant: "destructive",
            title: "File is too large.",
            description: `Maximum file size is ${
              MAX_FILE_SIZE / (1024 * 1024)
            }MB.`,
          });
        }
        return [...prevImages, ...newFiles];
      });
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif"],
    },
    maxFiles: MAX_FILES,
    maxSize: MAX_FILE_SIZE,
  });

  const removeImage = (index: number) => {
    setUploadedImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };

  const uploadFilesToStorage = async (files: File[]) => {
    const uploadPromises = files.map(async (file) => {
      const storageRef = ref(
        FIREBASE_STORAGE,
        `ama-images/${Date.now()}-${file.name}`
      );
      const snapshot = await uploadBytes(storageRef, file);
      return getDownloadURL(snapshot.ref);
    });

    const urls = await Promise.all(uploadPromises);
    return urls;
  };

  async function onSubmit({
    title,
    description,
  }: z.infer<typeof AMAAskFormValidation>) {
    if (isSubmitting) return;

    setIsSubmitting(true);
    setUploadProgress(0);

    try {
      // Upload images first
      let imageUrls: string[] = [];
      if (uploadedImages.length > 0) {
        toast({
          variant: "default",
          description: `uploading ${uploadedImages.length} image(s)...`,
        });
        imageUrls = await uploadFilesToStorage(uploadedImages);
        setUploadProgress(100);
      }

      const postData = {
        title,
        description,
        images: imageUrls,
        authorId: isAnonymous ? null : user?.uid,
        authorName: isAnonymous ? "Anonymous" : name || "Unknown",
        created_at: Timestamp.now(),
        isAnonymous,
        tags: [],
        status: "pending",
        answers: [],
        summary: null,
      };

      await addDoc(collection(FIREBASE_DB, "ama"), postData);
      toast({
        variant: "default",
        description: `Question posted successfully!`,
      });

      router.refresh();
      onClick();
    } catch (error) {
      console.error("Error submitting question:", error);
      toast({
        variant: "destructive",
        title: "Error submitting question",
      });
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
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
            disabled={isSubmitting}
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
            <label className="text-sm font-medium text-gray-300">
              Add Images (Optional)
            </label>
            <p className="text-sm text-gray-400 mb-2">
              You can upload up to {MAX_FILES} images (max{" "}
              {MAX_FILE_SIZE / (1024 * 1024)}MB each)
            </p>
            <div
              {...getRootProps({
                className: `border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                  isDragActive
                    ? "border-blue-500 bg-blue-500/10"
                    : "border-gray-700 hover:border-gray-600"
                } ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`,
              })}
              onClick={(e) => (isSubmitting ? e.stopPropagation() : null)}
            >
              <input {...getInputProps()} disabled={isSubmitting} />
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

            {/* Upload Progress */}
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="w-full bg-gray-700 rounded-full h-2.5 mt-2">
                <div
                  className="bg-blue-600 h-2.5 rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            )}

            {/* Image Previews */}
            {uploadedImages.length > 0 && (
              <div className="mt-4">
                <div className="flex flex-wrap gap-3">
                  {uploadedImages.map((file, idx) => (
                    <div key={idx} className="relative group">
                      <div className="w-24 h-24 relative">
                        <Image
                          src={URL.createObjectURL(file)}
                          alt={`Preview ${idx + 1}`}
                          fill
                          className="object-cover rounded-md border border-gray-700"
                        />
                        {!isSubmitting && (
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
                        )}
                      </div>
                      <div className="text-xs text-gray-400 mt-1 truncate w-24">
                        {file.name.length > 15
                          ? `${file.name.substring(0, 12)}...`
                          : file.name}
                      </div>
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
                checked={isAnonymous}
                onChange={setIsAnonymous}
                className={`${
                  isAnonymous ? "bg-blue-600" : "bg-gray-700"
                } relative inline-flex h-6 w-11 items-center rounded-full`}
                disabled={isSubmitting}
              >
                <span
                  className={`${
                    isAnonymous ? "translate-x-6" : "translate-x-1"
                  } inline-block h-4 w-4 transform rounded-full bg-white transition`}
                />
              </Switch>
              <label className="text-sm text-gray-300">Post Anonymously</label>
            </div>

            <div className="text-sm text-gray-400">
              {uploadedImages.length}/{MAX_FILES} images
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 pt-6">
          <button
            type="button"
            onClick={onClick}
            className="px-4 py-2 rounded-md border border-gray-700 text-gray-300 hover:bg-gray-800 transition-colors"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <SubmitButton
            isLoading={isSubmitting}
            className="px-4 py-2"
            disabled={isSubmitting || !form.formState.isValid}
          >
            {isSubmitting ? "Posting..." : "Post Question"}
          </SubmitButton>
        </div>
      </form>
    </Form>
  );
};

export default AskQuestionsPage;
