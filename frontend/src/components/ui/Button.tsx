import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "success" | "warning";
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  fullWidth = false,
  className,
  ...props
}) => {
  const baseClasses =
    "font-bold py-2 px-4 rounded-lg transition disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-amber-500 hover:bg-amber-600 disabled:bg-slate-600 text-white",
    secondary:
      "bg-slate-700 hover:bg-slate-600 disabled:bg-slate-600 text-white",
    danger: "bg-red-600 hover:bg-red-700 disabled:bg-slate-600 text-white",
    success: "bg-green-600 hover:bg-green-700 disabled:bg-slate-600 text-white",
    warning: "bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white",
  };

  const widthClass = fullWidth ? "w-full" : "";

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${widthClass} ${className}`}
      {...props}
    />
  );
};
