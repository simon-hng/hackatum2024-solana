"use client";

import React, { useState } from "react";
import { Input } from "~/components/ui/input";

export const EuroInput = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<"input">
>(({ className, type, ...props }, ref) => {
  const [value, setValue] = useState("");

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    // Remove any non-digit or non-decimal point characters
    const sanitizedValue = newValue.replace(/[^\d.]/g, "");
    // Ensure only one decimal point
    const parts = sanitizedValue.split(".");
    const formattedValue =
      parts[0] + (parts.length > 1 ? "." + parts?.at(1)?.slice(0, 2) : "");
    setValue(formattedValue);
  };

  const displayValue = value ? Number(value).toFixed(2) : "";

  return (
    <div className="relative w-full">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
        €
      </span>
      <Input
        type="text"
        ref={ref}
        inputMode="decimal"
        pattern="^\d*(\.\d{0,2})?$"
        value={displayValue}
        onChange={handleChange}
        placeholder="0.00"
        className="pl-7 pr-3"
        aria-label="Enter amount in euros"
        {...props}
      />
    </div>
  );
});
