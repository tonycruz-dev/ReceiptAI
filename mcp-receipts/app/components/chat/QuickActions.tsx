import {
  Calendar,
  Clock,
  FileText,
  Image,
  Tag,
  type LucideIcon,
} from "lucide-react";
import QuickActionPill from "../QuickActionPill";
import { QuickActionType } from "@/lib/types";

type ActionItem = {
  label: string;
  type: QuickActionType;
  icon: LucideIcon;
};

const receiptActions: ActionItem[] = [
  {
    label: "Create receipt from image",
    type: "create-receipt-from-image",
    icon: Image,
  },
  { label: "Get summary", type: "summary", icon: FileText },
  { label: "Get recent", type: "recent-receipts", icon: Clock },
  { label: "Get by category", type: "receipts-by-category", icon: Tag },
  { label: "Get by date", type: "receipts-by-date", icon: Calendar },
];

type QuickActionsProps = {
  onAction: (actionType: QuickActionType) => void;
};

export default function QuickActions({ onAction }: QuickActionsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {receiptActions.map((action) => (
        <QuickActionPill
          key={action.label}
          label={action.label}
          icon={action.icon}
          onClick={() => onAction(action.type)}
        />
      ))}
    </div>
  );
}
