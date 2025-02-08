"use client";

import React, { useState, useEffect } from "react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Control } from "react-hook-form";
import { FormFieldType } from "@/enum/FormFieldTypes";
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
import { marked } from "marked";

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

  const isObjectOptions = options.length > 0 && typeof options[0] === "object";
  const [inputValue, setInputValue] = useState("");
  const [filteredOptions, setFilteredOptions] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<string[]>(
    Array.isArray(field.value) ? field.value : []
  );

  useEffect(() => {
    if (field.value) {
      if (fieldType === FormFieldType.M_SEARCHABLE_SELECT) {
        setSelectedOptions(field.value);
      } else if (fieldType === FormFieldType.SEARCHABLE_SELECT) {
        if (isObjectOptions) {
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

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    setInputValue(input);
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
    setShowDropdown(true);
  };

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

  const handleRemoveOption = (option: string) => {
    const newSelected = selectedOptions.filter((item) => item !== option);
    setSelectedOptions(newSelected);
    field.onChange(newSelected);
  };

  const handleCreateNew = () => {
    if (allowNewOptions && inputValue.trim() !== "") {
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
