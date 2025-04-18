import React from "react";
import { Button } from "./ui/button";
import Image from "next/image";
interface ButtonProps {
  isLoading: boolean;
  className?: string;
  children: React.ReactNode;
  disabled?: boolean;
}

const SubmitButton = ({
  isLoading,
  className,
  children,
  disabled,
}: ButtonProps) => {
  return (
    <Button
      type="submit"
      disabled={isLoading || disabled}
      className={className ?? "shad-primary-btn w-full rounded-none"}
    >
      {isLoading ? (
        <div className="flex items-center gap-4">
          <Image
            src="/assets/icons/loader.svg"
            alt="loader"
            width={24}
            className="animate-spin"
            height={24}
          />
          loading...
        </div>
      ) : (
        children
      )}
    </Button>
  );
};

export default SubmitButton;
