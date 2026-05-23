import React from "react";
import { Card } from "@/components/ui";

interface ScoreCardProps {
  value: number;
  label: string;
  bgColor: string;
  textColor: string;
}

export const ScoreCard: React.FC<ScoreCardProps> = ({
  value,
  label,
  bgColor,
  textColor,
}) => {
  return (
    <div className={`${bgColor} rounded-xl p-6 text-center`}>
      <div className="text-4xl font-bold text-white">{value}</div>
      <div className={`${textColor} text-sm mt-2`}>{label}</div>
    </div>
  );
};
