type UploadMessageProps = {
  message: string;
  messageType: "success" | "error" | "info";
};

export default function UploadMessage({
  message,
  messageType,
}: UploadMessageProps) {
  if (!message) return null;

  const messageStyles =
    messageType === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : messageType === "error"
        ? "border-red-200 bg-red-50 text-red-700"
        : "border-slate-200 bg-slate-50 text-slate-700";

  return (
    <div
      className={`mt-5 rounded-2xl border px-4 py-3 text-sm ${messageStyles}`}
    >
      {message}
    </div>
  );
}
