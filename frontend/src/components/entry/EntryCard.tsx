import React from "react";
import { Card } from "@/components/ui";

interface EntryCardProps {
  title: string;
  emoji: string;
  description: string;
  isFormVisible: boolean;
  isConnected: boolean;
  onShowForm: () => void;
  children?: React.ReactNode;
}

export const EntryCard: React.FC<EntryCardProps> = ({
  title,
  emoji,
  description,
  isFormVisible,
  isConnected,
  onShowForm,
  children,
}) => {
  if (isFormVisible) {
    return <Card className="hover:border-amber-500/30 transition">{children}</Card>;
  }

  return (
    <Card className="hover:border-amber-500/30 transition">
      <div className="text-center mb-8">
        <div className="text-5xl mb-4">{emoji}</div>
        <h2 className="text-2xl font-bold text-white">{title}</h2>
        <p className="text-slate-400 text-sm mt-2">{description}</p>
      </div>
      <button
        onClick={onShowForm}
        disabled={!isConnected}
        className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition"
      >
        {title}
      </button>
    </Card>
  );
};
