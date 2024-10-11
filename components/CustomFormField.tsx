"use client";

import React, { useState } from "react";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Control } from "react-hook-form";
import { FormFieldType } from "./forms/NewRegisterForm";
import Image from "next/image";
import "react-phone-number-input/style.css";
import PhoneInput, { Value } from "react-phone-number-input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ImCross } from "react-icons/im";

interface CustomProps {
  control: Control<any>;
  fieldType: FormFieldType;
  type?: string;
  autocomplete?: string;
  name?: string;
  label?: string;
  placeholder?: string;
  iconSrc?: string;
  iconAlt?: string;
  disable?: boolean;
  dateFormat?: string;
  showTimeSelect?: boolean;
  children?: React.ReactNode;
  renderSkeleton?: (field: any) => React.ReactNode;
  options?: string[];
}

const RenderField = ({ field, props }: { field: any; props: CustomProps }) => {
  const {
    type,
    fieldType,
    iconAlt,
    iconSrc,
    placeholder,
    autocomplete,
    children,
    options,
  } = props;

  const [filteredOptions, setFilteredOptions] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState(""); // Track the input value
  const [showDropdown, setShowDropdown] = useState(false);

  const [selectedOptions, setSelectedOptions] = useState<string[]>([]); // Track selected options

  // Handle input change to filter options
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    setInputValue(input); // Update the input value

    // Filter the options based on the input
    const filtered = options!.filter((option) =>
      option.toLowerCase().includes(input.toLowerCase())
    );
    setFilteredOptions(filtered);
    setShowDropdown(true);
  };

  // Add selected option to the list
  const handleOptionClick = (option: string) => {
    if (!selectedOptions.includes(option)) {
      const newSelectedOptions = [...selectedOptions, option];
      setSelectedOptions(newSelectedOptions); // Add to selected options
      field.onChange(newSelectedOptions); // Update form state with selected options
    }
    setShowDropdown(false); // Close the dropdown
    setInputValue(""); // Clear the input
  };

  // Remove a selected option
  const handleRemoveOption = (option: string) => {
    const newSelectedOptions = selectedOptions.filter(
      (item) => item !== option
    );
    setSelectedOptions(newSelectedOptions);
    field.onChange(newSelectedOptions); // Update form state with updated options
  };

  // Handle creating a new option
  const handleCreateNew = () => {
    if (!selectedOptions.includes(inputValue)) {
      const newSelectedOptions = [...selectedOptions, inputValue];
      setSelectedOptions(newSelectedOptions); // Add new custom option to selected options
      field.onChange(newSelectedOptions); // Update form state with new custom option
    }
    setShowDropdown(false); // Close the dropdown
    setInputValue(""); // Clear the input
  };

  switch (fieldType) {
    case FormFieldType.INPUT:
      return (
        <div className="flex rounded-none border border-dark-500 bg-dark-400">
          {iconSrc && (
            <Image
              src={iconSrc}
              height={24}
              width={24}
              alt={iconAlt || "icon"}
              className="ml-2"
            />
          )}
          <FormControl>
            <Input
              placeholder={placeholder}
              type={type || "text"}
              autoComplete={autocomplete}
              {...field}
              className="shad-input border-0"
            />
          </FormControl>
        </div>
      );

    case FormFieldType.TEXTAREA:
      return (
        <FormControl>
          <Textarea
            placeholder={placeholder}
            {...field}
            className="shad-textarea bg-[#1f1f1e] rounded-none"
          />
        </FormControl>
      );

    case FormFieldType.PHONE_INPUT:
      return (
        <FormControl>
          <PhoneInput
            defaultCountry="IN"
            placeholder={placeholder}
            international
            withCountryCallingCode
            value={field.value as "" | undefined}
            onChange={field.onChange}
            className="input-phone"
          />
        </FormControl>
      );

    case FormFieldType.CHECKBOX:
      return (
        <FormControl>
          <Checkbox checked={field.value} onCheckedChange={field.onChange}>
            {children}
          </Checkbox>
        </FormControl>
      );

    case FormFieldType.SELECT:
      return (
        <FormControl>
          <Select onValueChange={field.onChange}>
            <SelectTrigger>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>{children}</SelectContent>
          </Select>
        </FormControl>
      );

    case FormFieldType.SKELETON:
      return props.renderSkeleton ? props.renderSkeleton(field) : <Skeleton />;

    case FormFieldType.SEARCHABLE_SELECT:
      return (
        <div className="relative">
          <FormControl>
            <Input
              placeholder={placeholder}
              value={inputValue}
              onChange={handleSearchChange}
              className="shad-input border-0 rounded-none"
            />
          </FormControl>

          {showDropdown && (
            <ul className="absolute z-10 w-full bg-black border border-gray-300 shadow-lg max-h-40 overflow-auto scrollbar-hide">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option, index) => (
                  <li
                    key={index}
                    className="p-2 cursor-pointer hover:bg-gray-800"
                    onClick={() => handleOptionClick(option)}
                  >
                    {option}
                  </li>
                ))
              ) : (
                // No match found, allow the user to create a new degree
                <li
                  className="p-2 cursor-pointer hover:bg-gray-800"
                  onClick={handleCreateNew}
                >
                  Create new degree: <strong>{inputValue}</strong>
                </li>
              )}
            </ul>
          )}
        </div>
      );

    case FormFieldType.M_SEARCHABLE_SELECT:
      return (
        <div className="relative w-full">
          {/* Display selected items as chips */}
          <div className="flex flex-wrap gap-2 mb-2">
            {selectedOptions.map((option, index) => (
              <div
                key={index}
                className="bg-black flex items-center px-3 py-1 text-sm"
              >
                <span>{option}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveOption(option)}
                  className="ml-2 text-gray-500 hover:text-gray-700"
                >
                  <ImCross />
                </button>
              </div>
            ))}
          </div>
          <div className="mb-2">
            <input
              type="text"
              placeholder={placeholder}
              value={inputValue}
              onChange={handleSearchChange}
              className="w-full p-2 shad-textarea"
            />
          </div>

          {/* Dropdown for filtered options */}
          {showDropdown && (
            <ul className="absolute z-10 w-full bg-black border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto scrollbar-hide">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option, index) => (
                  <li
                    key={index}
                    className="p-2 hover:bg-gray-800 cursor-pointer"
                    onClick={() => handleOptionClick(option)}
                  >
                    {option}
                  </li>
                ))
              ) : (
                // If no match found, allow the user to create a new option
                <li
                  className="p-2 text-white hover:bg-gray-800 cursor-pointer"
                  onClick={handleCreateNew}
                >
                  Add: <strong>{inputValue}</strong>
                </li>
              )}
            </ul>
          )}
        </div>
      );

    default:
      return null;
  }
};

const CustomFormField = (props: CustomProps) => {
  const { control, fieldType, name, label } = props;

  return (
    <FormField
      control={control}
      name={name || "name is not defined"}
      render={({ field }) => (
        <FormItem className="flex-1">
          {fieldType !== FormFieldType.CHECKBOX && label && (
            <FormLabel>{label}</FormLabel>
          )}

          <RenderField field={field} props={props} />

          <FormMessage className="shad-error" />
        </FormItem>
      )}
    />
  );
};

export default CustomFormField;
