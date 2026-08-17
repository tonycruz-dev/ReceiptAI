import {
  AdjustmentsHorizontalIcon,
  BookOpenIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { LoaderCircle, Send, X } from "lucide-react";
import type {
  CatalogResponse,
  McpPrompt,
  McpResourceTemplate,
  McpSelection,
  McpStaticResource,
  McpTool,
  MenuKey,
} from "@/lib/types";
import ActionMenuButton from "../ActionMenuButton";
import MenuItem from "../MenuItem";
import MenuPanel from "../MenuPanel";

type Props = {
  input: string;
  setInput: (value: string) => void;
  sending: boolean;
  onSend: () => void;
  selection: McpSelection | null;
  openMenu: MenuKey;
  setOpenMenu: React.Dispatch<React.SetStateAction<MenuKey>>;
  catalog: CatalogResponse;
  loading: boolean;
  error: string | null;
  search: string;
  setSearch: (value: string) => void;
  onSelect: (selection: McpSelection) => void;
  onClearSelection: () => void;
};

export default function Composer(props: Props) {
  const query = props.search.trim().toLowerCase();
  const matches = (values: Array<string | undefined>) =>
    !query || values.filter(Boolean).join(" ").toLowerCase().includes(query);
  const tools = props.catalog.tools.filter((item) =>
    matches([item.name, item.title, item.description]),
  );
  const resources = props.catalog.resources.filter((item) =>
    matches([item.name, item.title, item.description, item.uri]),
  );
  const templates = props.catalog.resourceTemplates.filter((item) =>
    matches([item.name, item.title, item.description, item.uriTemplate]),
  );
  const prompts = props.catalog.prompts.filter((item) =>
    matches([item.name, item.title, item.description]),
  );

  return (
    <section className="w-full" aria-label="Chat composer">
      <div className="rounded-[1.5rem] border border-zinc-200/90 bg-white/95 p-3 shadow-[0_14px_45px_-25px_rgba(24,24,27,0.45)] ring-1 ring-white transition focus-within:border-indigo-300 focus-within:ring-4 focus-within:ring-indigo-100/70 sm:p-4">
        <textarea
          value={props.input}
          onChange={(event) => props.setInput(event.target.value)}
          placeholder="Ask about receipts or select an MCP capability..."
          disabled={props.sending}
          aria-label="Message Receipt Chat"
          className="min-h-16 w-full resize-none bg-transparent px-2 py-2 text-[15px] leading-relaxed text-zinc-900 outline-none placeholder:text-zinc-400 disabled:cursor-not-allowed disabled:opacity-60 sm:px-3 sm:text-base"
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              props.onSend();
            }
          }}
        />

        <div className="mt-2 flex flex-col gap-3 border-t border-zinc-100 px-1 pt-3 sm:px-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1 rounded-xl bg-zinc-100/80 p-1">
            <CapabilityMenu
              icon={<AdjustmentsHorizontalIcon className="h-4 w-4" />}
              label={`Tools (${props.catalog.tools.length})`}
              title="MCP Tools"
              menu="tools"
              {...props}
            >
              {tools.map((item) => itemRow(item, props))}
            </CapabilityMenu>
            <CapabilityMenu
              icon={<BookOpenIcon className="h-4 w-4" />}
              label={`Resources (${props.catalog.resources.length + props.catalog.resourceTemplates.length})`}
              title="Resources and templates"
              menu="resources"
              {...props}
            >
              {resources.map((item) => itemRow(item, props))}
              {templates.map((item) => itemRow(item, props))}
            </CapabilityMenu>
            <CapabilityMenu
              icon={<SparklesIcon className="h-4 w-4" />}
              label={`Prompts (${props.catalog.prompts.length})`}
              title="MCP Prompts"
              menu="prompts"
              {...props}
            >
              {prompts.map((item) => itemRow(item, props))}
            </CapabilityMenu>
            </div>

            <span className="hidden text-xs text-zinc-400 sm:inline">
              Enter to send · Shift + Enter for a new line
            </span>
          </div>

          <div className="flex min-w-0 items-center justify-between gap-3">
            {props.selection ? (
              <div className="flex min-w-0 items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 py-1.5 pl-3 pr-1.5 text-xs font-medium text-indigo-800">
                <span className="shrink-0 capitalize text-indigo-500">
                  {props.selection.kind === "resourceTemplate"
                    ? "Resource"
                    : props.selection.kind}
                </span>
                <span className="truncate">
                  {props.selection.title || props.selection.name}
                </span>
                <button
                  type="button"
                  onClick={props.onClearSelection}
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-indigo-500 transition hover:bg-indigo-100 hover:text-indigo-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40"
                  aria-label="Remove selected MCP capability"
                >
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>
            ) : (
              <span className="truncate text-xs text-zinc-400">
                Optional: select an MCP capability
              </span>
            )}
            <button
              type="button"
              onClick={props.onSend}
              disabled={props.sending || !props.input.trim()}
              className="flex shrink-0 items-center gap-2 rounded-xl bg-zinc-950 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-zinc-950/15 transition-all hover:-translate-y-0.5 hover:bg-indigo-600 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40 sm:px-5"
            >
              {props.sending ? (
                <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <Send className="h-4 w-4" aria-hidden="true" />
              )}
              {props.sending ? "Sending..." : "Send"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function CapabilityMenu({
  icon,
  label,
  title,
  menu,
  children,
  ...props
}: Props & {
  icon: React.ReactNode;
  label: string;
  title: string;
  menu: Exclude<MenuKey, null>;
  children: React.ReactNode;
}) {
  return (
    <ActionMenuButton
      icon={icon}
      label={label}
      active={props.openMenu === menu}
      onClick={() =>
        props.setOpenMenu((current) => {
          props.setSearch("");
          return current === menu ? null : menu;
        })
      }
    >
      <MenuPanel
        title={title}
        loading={props.loading}
        error={props.error}
        emptyTitle="No capabilities found"
        search={props.search}
        onSearchChange={props.setSearch}
        searchPlaceholder={`Search ${menu}...`}
      >
        {children}
      </MenuPanel>
    </ActionMenuButton>
  );
}

function itemRow(
  item: McpTool | McpStaticResource | McpResourceTemplate | McpPrompt,
  props: Props,
) {
  const identifier =
    item.kind === "resource"
      ? item.uri
      : item.kind === "resourceTemplate"
        ? item.uriTemplate
        : item.name;
  const selected =
    props.selection?.kind === item.kind &&
    (item.kind === "resource"
      ? props.selection.kind === "resource" && props.selection.uri === item.uri
      : item.kind === "resourceTemplate"
        ? props.selection.kind === "resourceTemplate" &&
          props.selection.uriTemplate === item.uriTemplate
        : props.selection.name === item.name);

  return (
    <MenuItem
      key={`${item.kind}:${identifier}`}
      title={`${item.title || item.name}${item.kind === "resourceTemplate" ? " (template)" : ""}`}
      description={item.description || identifier}
      selected={selected}
      onClick={() => props.onSelect(item)}
    />
  );
}
