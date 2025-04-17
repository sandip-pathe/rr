"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import CustomModal from "@/components/ModalWrapper";
import { FiX, FiTag, FiCalendar, FiMail, FiLink } from "react-icons/fi";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProblemFormData } from "@/types/problem";
import Modal from "@/components/Modal";
import { IoCloseCircleSharp } from "react-icons/io5";

const predefinedCategories = [
  "AI/ML",
  "Blockchain",
  "Healthcare",
  "Education",
  "Agriculture",
  "Sustainability",
  "Finance",
  "IoT",
  "Robotics",
  "Cybersecurity",
  "Data Science",
  "Cloud Computing",
];

export default function AddProblemModal({
  isOpen,
  onClose,
  onSubmit,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProblemFormData) => void;
}) {
  const [formData, setFormData] = useState<ProblemFormData>({
    title: "",
    description: "",
    categories: [],
  });
  const [newCategory, setNewCategory] = useState("");
  const [newResource, setNewResource] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      categories: [],
    });
    setNewCategory("");
    setNewResource("");
  };

  const toggleCategory = (category: string) => {
    setFormData((prev) => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category],
    }));
  };

  const addNewCategory = () => {
    if (newCategory && !formData.categories.includes(newCategory)) {
      setFormData((prev) => ({
        ...prev,
        categories: [...prev.categories, newCategory],
      }));
      setNewCategory("");
    }
  };

  const addResource = () => {
    if (newResource) {
      setFormData((prev) => ({
        ...prev,
        resources: [...(prev.resources || []), newResource],
      }));
      setNewResource("");
    }
  };

  const removeResource = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      resources: prev.resources?.filter((_, i) => i !== index) || [],
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-10">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">
          Submit a New Problem Statement
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <IoCloseCircleSharp size={28} />
        </button>
      </div>
      <p className="text-sm text-gray-400 mb-4">
        Share a challenge that needs innovative solutions from our community
      </p>

      <div>
        <label className="block text-sm font-medium text-gray-200 mb-1">
          Problem Title *
        </label>
        <Input
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Clear, concise problem statement"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-200 mb-1">
          Detailed Description *
        </label>
        <Textarea
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          rows={5}
          placeholder="Describe the problem in detail, including any relevant context, current solutions (if any), and why this problem matters..."
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-1">
            Difficulty Level
          </label>
          <Select
            onValueChange={(value) =>
              setFormData({ ...formData, difficulty: value as any })
            }
            value={formData.difficulty}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-200 mb-1">
            Deadline (if applicable)
          </label>
          <div className="relative">
            <Input
              type="date"
              value={formData.deadline}
              onChange={(e) =>
                setFormData({ ...formData, deadline: e.target.value })
              }
            />
            <FiCalendar className="absolute right-3 top-3 text-gray-400" />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-200 mb-1">
          Expected Outcomes
        </label>
        <Textarea
          value={formData.expectedOutcomes}
          onChange={(e) =>
            setFormData({ ...formData, expectedOutcomes: e.target.value })
          }
          rows={3}
          placeholder="What would a successful solution look like? What are the key deliverables?"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-200 mb-2">
          Categories/Tags *
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {formData.categories.map((category) => (
            <span
              key={category}
              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
            >
              {category}
              <button
                type="button"
                onClick={() => toggleCategory(category)}
                className="ml-1 text-blue-600 hover:text-blue-800"
              >
                <FiX size={14} />
              </button>
            </span>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {predefinedCategories
            .filter((c) => !formData.categories.includes(c))
            .map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => toggleCategory(category)}
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 hover:bg-gray-200"
              >
                <FiTag className="mr-1" /> {category}
              </button>
            ))}
        </div>

        <div className="flex gap-2">
          <Input
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="Add new category"
          />
          <Button
            type="button"
            variant="outline"
            onClick={addNewCategory}
            disabled={!newCategory}
          >
            Add
          </Button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-200 mb-1">
          Resources (links, documents, etc.)
        </label>
        {formData.resources?.map((resource, index) => (
          <div key={index} className="flex items-center gap-2 mb-2">
            <FiLink className="text-gray-400" />
            <span className="text-sm text-gray-300 truncate flex-1">
              {resource}
            </span>
            <button
              type="button"
              onClick={() => removeResource(index)}
              className="text-red-500 hover:text-red-700"
            >
              <FiX size={14} />
            </button>
          </div>
        ))}
        <div className="flex gap-2 mt-2">
          <Input
            value={newResource}
            onChange={(e) => setNewResource(e.target.value)}
            placeholder="Add resource URL"
            type="url"
          />
          <Button
            type="button"
            variant="outline"
            onClick={addResource}
            disabled={!newResource}
          >
            Add
          </Button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-200 mb-1">
          Contact Email (optional)
        </label>
        <div className="relative">
          <Input
            type="email"
            value={formData.contactEmail || ""}
            onChange={(e) =>
              setFormData({ ...formData, contactEmail: e.target.value })
            }
            placeholder="For follow-up questions"
          />
          <FiMail className="absolute right-3 top-3 text-gray-400" />
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            onClose();
            resetForm();
          }}
        >
          Cancel
        </Button>
        <Button type="submit">Submit Problem</Button>
      </div>
    </form>
  );
}
