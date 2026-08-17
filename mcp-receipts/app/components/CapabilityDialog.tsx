import type { CapabilityField } from "@/lib/mcp/capability-utils";
import type { McpSelection } from "@/lib/types";
import { AlertCircle, X } from "lucide-react";

type Props = {
  selection: McpSelection | null;
  fields: CapabilityField[];
  values: Record<string, string>;
  errors: Record<string, string>;
  mutation: boolean;
  confirmed: boolean;
  busy: boolean;
  onValueChange: (path: string, value: string) => void;
  onConfirmedChange: (value: boolean) => void;
  onClose: () => void;
  onSubmit: () => void;
};

export default function CapabilityDialog({
  selection,
  fields,
  values,
  errors,
  mutation,
  confirmed,
  busy,
  onValueChange,
  onConfirmedChange,
  onClose,
  onSubmit,
}: Props) {
  if (!selection) return null;

  const title = selection.title || selection.name;
  const action =
    selection.kind === "tool"
      ? "Call tool"
      : selection.kind === "resource"
        ? "Read resource"
        : selection.kind === "resourceTemplate"
          ? "Resolve and read"
          : "Retrieve and apply prompt";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/50 px-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[1.75rem] border border-white/70 bg-white p-5 shadow-2xl shadow-zinc-950/20 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
        <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
          {selection.kind === "resourceTemplate"
            ? "Resource template"
            : selection.kind}
        </div>
        <h3 className="mt-1 text-lg font-semibold text-zinc-900">{title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            aria-label="Close capability dialog"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 disabled:opacity-50"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        {selection.description ? (
          <p className="mt-2 text-sm text-zinc-600">{selection.description}</p>
        ) : null}

        {selection.kind === "resource" ? (
          <p className="mt-4 rounded-xl bg-zinc-50 p-3 font-mono text-xs text-zinc-700">
            {selection.uri}
          </p>
        ) : null}
        {selection.kind === "resourceTemplate" ? (
          <p className="mt-4 rounded-xl bg-zinc-50 p-3 font-mono text-xs text-zinc-700">
            {selection.uriTemplate}
          </p>
        ) : null}

        <div className="mt-5 space-y-4">
          {fields.map((field) => (
            <label key={field.path} className="block space-y-1">
              <span className="text-sm font-medium text-zinc-800">
                {field.label}
                {field.required ? " *" : ""}
              </span>
              {field.description ? (
                <span className="block text-xs text-zinc-500">
                  {field.description}
                </span>
              ) : null}
              <input
                type={inputType(field)}
                value={values[field.path] ?? ""}
                onChange={(event) => onValueChange(field.path, event.target.value)}
                aria-invalid={Boolean(errors[field.path])}
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 outline-none transition focus:border-indigo-300 focus:bg-white focus:ring-4 focus:ring-indigo-100/70 aria-invalid:border-red-300 aria-invalid:bg-red-50"
              />
              {errors[field.path] ? (
                <span className="block text-xs text-red-600">
                  {errors[field.path]}
                </span>
              ) : null}
            </label>
          ))}
        </div>

        {mutation ? (
          <label className="mt-5 flex gap-3 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(event) => onConfirmedChange(event.target.checked)}
            />
            I understand that this tool can change receipt data and I want to run it.
          </label>
        ) : null}

        {errors._form ? (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <p>{errors._form}</p>
          </div>
        ) : null}

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={busy}
            className="rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={busy || (mutation && !confirmed)}
            className="rounded-xl bg-zinc-950 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40"
          >
            {busy ? "Working..." : action}
          </button>
        </div>
      </div>
    </div>
  );
}

function inputType(field: CapabilityField) {
  if (field.schema.format === "date") return "date";
  if (field.schema.format === "date-time") return "datetime-local";
  const type = Array.isArray(field.schema.type)
    ? field.schema.type.find((item) => item !== "null")
    : field.schema.type;
  return type === "number" || type === "integer" ? "number" : "text";
}
