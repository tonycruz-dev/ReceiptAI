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
  disabled?: boolean;
};

export default function QuickActions({ onAction, disabled }: QuickActionsProps) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-2 px-1">
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
          Quick actions
        </span>
        <span className="h-px flex-1 bg-zinc-200/80" />
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1 sm:flex-wrap">
        {receiptActions.map((action) => (
          <QuickActionPill
            key={action.label}
            label={action.label}
            icon={action.icon}
            disabled={disabled}
            onClick={() => onAction(action.type)}
          />
        ))}
      </div>
    </div>
  );
}
