import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import CapabilityDialog from "./CapabilityDialog";

describe("CapabilityDialog", () => {
  it("blocks mutation submission until the user explicitly confirms", () => {
    const submit = vi.fn();
    render(
      <CapabilityDialog
        selection={{ kind: "tool", name: "delete_receipt", inputSchema: { type: "object" } }}
        fields={[]}
        values={{}}
        errors={{}}
        mutation
        confirmed={false}
        busy={false}
        onValueChange={vi.fn()}
        onConfirmedChange={vi.fn()}
        onClose={vi.fn()}
        onSubmit={submit}
      />,
    );
    const button = screen.getByRole("button", { name: "Call tool" });
    expect(button).toBeDisabled();
    fireEvent.click(button);
    expect(submit).not.toHaveBeenCalled();
  });

  it("renders field-level validation errors", () => {
    render(
      <CapabilityDialog
        selection={{ kind: "prompt", name: "receipts_by_date", arguments: [{ name: "date", required: true }] }}
        fields={[{ path: "date", label: "Date", required: true, schema: { type: "string", format: "date" } }]}
        values={{ date: "" }}
        errors={{ date: "Date is required." }}
        mutation={false}
        confirmed={false}
        busy={false}
        onValueChange={vi.fn()}
        onConfirmedChange={vi.fn()}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );
    expect(screen.getByText("Date is required.")).toBeInTheDocument();
  });
});
