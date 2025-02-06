"use client";

import React, { useState, useEffect } from "react";
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
import PhoneInput from "react-phone-number-input";
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

// Extend the props to allow passing option key/label names.
interface CustomProps {
  control: Control<any>;
  fieldType: FormFieldType;
  type?: string;
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
  options?: any[];
  allowNewOptions?: boolean;
  optionKey?: string;
  optionLabel?: string;
}

const RenderField = ({ field, props }: { field: any; props: CustomProps }) => {
  const {
    type,
    fieldType,
    iconAlt,
    iconSrc,
    placeholder,
    children,
    options = [],
    allowNewOptions = true,
    optionKey = "id",
    optionLabel = "name",
  } = props;

  // Determine if options are objects (if at least one exists and is object)
  const isObjectOptions = options.length > 0 && typeof options[0] === "object";

  // Local state for input value (used in searchable selects)
  const [inputValue, setInputValue] = useState("");
  // Local state for filtered options (array of either strings or objects)
  const [filteredOptions, setFilteredOptions] = useState<any[]>([]);
  // For multi-select, maintain selected options as an array of string ids.
  const [selectedOptions, setSelectedOptions] = useState<string[]>(
    Array.isArray(field.value) ? field.value : []
  );
  // For single select (SEARCHABLE_SELECT), we assume field.value is the id or value.
  // We will store the display value (if using object options) in inputValue.

  // Sync initial field value for searchable selects.
  useEffect(() => {
    if (field.value) {
      if (fieldType === FormFieldType.M_SEARCHABLE_SELECT) {
        // Expect field.value to be an array of ids.
        setSelectedOptions(field.value);
      } else if (fieldType === FormFieldType.SEARCHABLE_SELECT) {
        if (isObjectOptions) {
          // Look up the matching object using the stored id.
          const selectedObj = options.find(
            (o: any) => o[optionKey] === field.value
          );
          if (selectedObj) {
            setInputValue(selectedObj[optionLabel]);
          }
        } else {
          setInputValue(field.value);
        }
      }
    }
  }, [
    field.value,
    fieldType,
    isObjectOptions,
    options,
    optionKey,
    optionLabel,
  ]);

  // Handler for input change in searchable selects.
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    setInputValue(input);

    // Filter options based on whether they are objects or plain strings.
    if (isObjectOptions) {
      const filtered = options.filter((option: any) =>
        option[optionLabel].toLowerCase().includes(input.toLowerCase())
      );
      setFilteredOptions(filtered);
    } else {
      const filtered = options.filter((option: string) =>
        option.toLowerCase().includes(input.toLowerCase())
      );
      setFilteredOptions(filtered);
    }
    // Show the dropdown (if any matches)
    setShowDropdown(true);
  };

  // State to control dropdown visibility.
  const [showDropdown, setShowDropdown] = useState(false);

  // Single select: when an option is clicked, update input and field.
  const handleOptionClick = (option: any) => {
    if (isObjectOptions) {
      setInputValue(option[optionLabel]);
      field.onChange(option[optionKey]);
    } else {
      setInputValue(option);
      field.onChange(option);
    }
    setShowDropdown(false);
  };

  // Multi-select: when an option is clicked, add its value.
  const handleMultiOptionClick = (option: any) => {
    const value = isObjectOptions ? option[optionKey] : option;
    if (!selectedOptions.includes(value)) {
      const newSelected = [...selectedOptions, value];
      setSelectedOptions(newSelected);
      field.onChange(newSelected);
    }
    setInputValue("");
    setShowDropdown(false);
  };

  // Remove an item from the multi-select.
  const handleRemoveOption = (option: string) => {
    const newSelected = selectedOptions.filter((item) => item !== option);
    setSelectedOptions(newSelected);
    field.onChange(newSelected);
  };

  // Handler for adding new option if allowed.
  const handleCreateNew = () => {
    if (allowNewOptions && inputValue.trim() !== "") {
      // In this case, treat the new value as a string.
      if (fieldType === FormFieldType.M_SEARCHABLE_SELECT) {
        const newSelected = [...selectedOptions, inputValue];
        setSelectedOptions(newSelected);
        field.onChange(newSelected);
      } else {
        setInputValue(inputValue);
        field.onChange(inputValue);
      }
    }
    setShowDropdown(false);
    setInputValue("");
  };

  // Helper to get display label for a given value (id) in multi-select.
  const getOptionLabel = (value: string) => {
    if (isObjectOptions) {
      const found = options.find((o: any) => o[optionKey] === value);
      return found ? found[optionLabel] : value;
    }
    return value;
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
              autoComplete={true}
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
            className="shad-textarea border-dark-500 bg-dark-400 rounded-none"
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
            value={field.value || ""}
            onChange={field.onChange}
            className="input-phone border-dark-500 bg-dark-400"
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
          <Select onValueChange={field.onChange} value={field.value}>
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
        <div className="relative w-full">
          <FormControl>
            <Input
              placeholder={placeholder}
              value={inputValue}
              onChange={handleSearchChange}
              className="shad-input rounded-none border-dark-500 bg-dark-400"
            />
          </FormControl>
          {showDropdown && (
            <ul className="absolute z-10 w-full bg-black border border-gray-300 shadow-lg max-h-40 overflow-auto scrollbar-hide rounded-sm">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option: any, index: number) => (
                  <li
                    key={index}
                    className="p-2 cursor-pointer hover:bg-gray-800"
                    onClick={() => handleOptionClick(option)}
                  >
                    {isObjectOptions ? option[optionLabel] : option}
                  </li>
                ))
              ) : allowNewOptions ? (
                <li
                  className="p-2 cursor-pointer hover:bg-gray-800"
                  onClick={handleCreateNew}
                >
                  Add New: <strong>{inputValue}</strong>
                </li>
              ) : null}
            </ul>
          )}
        </div>
      );

    case FormFieldType.M_SEARCHABLE_SELECT:
      return (
        <div className="relative w-full">
          <div className="flex flex-wrap gap-2 mb-2">
            {selectedOptions.map((option, index) => (
              <div
                key={index}
                className="bg-black flex items-center px-3 py-1 text-sm rounded"
              >
                <span>{getOptionLabel(option)}</span>
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
          <FormControl>
            <Input
              type="text"
              placeholder={placeholder}
              value={inputValue}
              onChange={handleSearchChange}
              className="w-full p-2 shad-textarea border-dark-500 bg-dark-400"
            />
          </FormControl>
          {showDropdown && (
            <ul className="absolute z-10 w-full bg-black border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto scrollbar-hide">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option: any, index: number) => (
                  <li
                    key={index}
                    className="p-2 hover:bg-gray-800 cursor-pointer"
                    onClick={() => handleMultiOptionClick(option)}
                  >
                    {isObjectOptions ? option[optionLabel] : option}
                  </li>
                ))
              ) : allowNewOptions ? (
                <li
                  className="p-2 text-white hover:bg-gray-800 cursor-pointer"
                  onClick={handleCreateNew}
                >
                  Add: <strong>{inputValue}</strong>
                </li>
              ) : null}
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
