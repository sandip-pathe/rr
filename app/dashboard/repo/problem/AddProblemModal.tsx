"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import CustomModal from "@/components/ModalWrapper";
import { FiX, FiTag } from "react-icons/fi";

const categories = [
  "AI/ML",
  "Blockchain",
  "Healthcare",
  "Education",
  "Agriculture",
  "Sustainability",
  "Finance",
  "IoT",
];

export default function AddProblemModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Submit logic here
    console.log({ title, description, categories: selectedCategories });
    onClose();
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const addNewCategory = () => {
    if (newCategory && !selectedCategories.includes(newCategory)) {
      setSelectedCategories([...selectedCategories, newCategory]);
      setNewCategory("");
    }
  };

  return (
    <CustomModal isOpen={isOpen} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <h2 className="text-lg font-semibold text-white mb-4">
          Add New Problem Statement
        </h2>
        <p className="text-sm text-gray-400 mb-4">
          Define a problem that needs solving
        </p>
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-1">
            Problem Title
          </label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Clear, concise problem statement"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-200 mb-1">
            Detailed Description
          </label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            placeholder="Describe the problem in detail, including any relevant context..."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-200 mb-2">
            Categories/Tags
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {selectedCategories.map((category) => (
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
            {categories
              .filter((c) => !selectedCategories.includes(c))
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

        <div className="flex justify-end gap-4 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Submit Problem</Button>
        </div>
      </form>
    </CustomModal>
  );
}
