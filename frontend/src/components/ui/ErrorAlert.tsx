import React from "react";

interface ErrorAlertProps {
  message: string;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({ message }) => {
  return (
    <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-3 text-red-200 text-sm">
      {message}
    </div>
  );
};
