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
  allowNewOptions?: boolean;
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
    allowNewOptions = true,
  } = props;

  const [filteredOptions, setFilteredOptions] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState(field.value || "");
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<string[]>(
    field.value || []
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    setInputValue(input);

    const filtered = options!.filter((option) =>
      option.toLowerCase().includes(input.toLowerCase())
    );
    setFilteredOptions(filtered);
    setShowDropdown(true);
  };

  const handleOptionClick = (option: string) => {
    setInputValue(option);
    field.onChange(option);
    setShowDropdown(false);
  };

  const handleMultiOptionClick = (option: string) => {
    if (!selectedOptions.includes(option)) {
      const newSelectedOptions = [...selectedOptions, option];
      setSelectedOptions(newSelectedOptions);
      field.onChange(newSelectedOptions);
    }
    setInputValue("");
    setShowDropdown(false);
  };

  const handleRemoveOption = (option: string) => {
    const newSelectedOptions = selectedOptions.filter(
      (item) => item !== option
    );
    setSelectedOptions(newSelectedOptions);
    field.onChange(newSelectedOptions);
  };

  const handleCreateNew = () => {
    if (allowNewOptions && inputValue.trim() !== "") {
      setSelectedOptions([...selectedOptions, inputValue]);
      field.onChange([...selectedOptions, inputValue]);
    }
    setShowDropdown(false);
    setInputValue("");
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
            value={field.value as "" | undefined}
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
                filteredOptions.map((option, index) => (
                  <li
                    key={index}
                    className="p-2 cursor-pointer hover:bg-gray-800"
                    onClick={() => handleOptionClick(option)}
                  >
                    {option}
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
                filteredOptions.map((option, index) => (
                  <li
                    key={index}
                    className="p-2 hover:bg-gray-800 cursor-pointer"
                    onClick={() => handleMultiOptionClick(option)}
                  >
                    {option}
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
