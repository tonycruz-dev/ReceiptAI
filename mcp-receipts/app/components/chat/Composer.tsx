import { RefObject } from "react";
import {
  AdjustmentsHorizontalIcon,
  BookOpenIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { Send } from "lucide-react";
import {
  CatalogResponse,
  MenuKey,
  PromptItem,
  ResourceItem,
  ToolItem,
} from "@/lib/types";
import ActionMenuButton from "../ActionMenuButton";
import MenuItem from "../MenuItem";
import MenuPanel from "../MenuPanel";

type ComposerProps = {
  input: string;
  setInput: (value: string) => void;
  sending: boolean;
  onSend: () => void;
  selectedLabel: string;
  menuRef: RefObject<HTMLDivElement | null>;
  openMenu: MenuKey;
  setOpenMenu: React.Dispatch<React.SetStateAction<MenuKey>>;
  catalog: CatalogResponse;
  loading: boolean;
  error: string | null;
  search: string;
  setSearch: (value: string) => void;
  filteredTools: ToolItem[];
  filteredResources: ResourceItem[];
  filteredPrompts: PromptItem[];
  selectedTool: ToolItem | null;
  selectedResource: ResourceItem | null;
  selectedPrompt: PromptItem | null;
  onToolSelect: (tool: ToolItem) => void;
  onResourceSelect: (resource: ResourceItem) => void;
  onPromptSelect: (prompt: PromptItem) => void;
};

export default function Composer({
  input,
  setInput,
  sending,
  onSend,
  selectedLabel,
  menuRef,
  openMenu,
  setOpenMenu,
  catalog,
  loading,
  error,
  search,
  setSearch,
  filteredTools,
  filteredResources,
  filteredPrompts,
  selectedTool,
  selectedResource,
  selectedPrompt,
  onToolSelect,
  onResourceSelect,
  onPromptSelect,
}: ComposerProps) {
  return (
    <section className="w-full">
      <div className="rounded-2xl border border-zinc-200 bg-white/95 p-4 shadow-sm backdrop-blur">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about receipts, use a tool, browse a resource, or run a prompt..."
          className="min-h-16 w-full resize-none bg-transparent px-3 py-2 text-base leading-relaxed outline-none placeholder:text-zinc-400"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSend();
            }
          }}
        />

        <div className="mt-2 flex flex-wrap items-center justify-between gap-3 px-2 pb-1">
          <div ref={menuRef} className="flex flex-wrap items-center gap-2">
            <ActionMenuButton
              icon={<AdjustmentsHorizontalIcon className="h-4 w-4" />}
              label={`Tools (${catalog.tools.length})`}
              active={openMenu === "tools"}
              onClick={() =>
                setOpenMenu((current) => (current === "tools" ? null : "tools"))
              }
            >
              <MenuPanel
                title="MCP Tools"
                loading={loading}
                error={error}
                emptyTitle="No tools found"
                search={search}
                onSearchChange={setSearch}
                searchPlaceholder="Search tools..."
              >
                {filteredTools.map((tool) => (
                  <MenuItem
                    key={tool.name}
                    title={tool.name}
                    description={tool.description}
                    selected={selectedTool?.name === tool.name}
                    onClick={() => onToolSelect(tool)}
                  />
                ))}
              </MenuPanel>
            </ActionMenuButton>

            <ActionMenuButton
              icon={<BookOpenIcon className="h-4 w-4" />}
              label={`Resources (${catalog.resources.length})`}
              active={openMenu === "resources"}
              onClick={() =>
                setOpenMenu((current) =>
                  current === "resources" ? null : "resources",
                )
              }
            >
              <MenuPanel
                title="Resources"
                loading={loading}
                error={error}
                emptyTitle="No resources found"
                search={search}
                onSearchChange={setSearch}
                searchPlaceholder="Search resources..."
              >
                {filteredResources.map((resource) => (
                  <MenuItem
                    key={resource.uri}
                    title={resource.title || resource.name || resource.uri}
                    description={resource.description || resource.uri}
                    selected={selectedResource?.uri === resource.uri}
                    onClick={() => onResourceSelect(resource)}
                  />
                ))}
              </MenuPanel>
            </ActionMenuButton>

            <ActionMenuButton
              icon={<SparklesIcon className="h-4 w-4" />}
              label={`Prompts (${catalog.prompts.length})`}
              active={openMenu === "prompts"}
              onClick={() =>
                setOpenMenu((current) =>
                  current === "prompts" ? null : "prompts",
                )
              }
            >
              <MenuPanel
                title="Prompts"
                loading={loading}
                error={error}
                emptyTitle="No prompts found"
                search={search}
                onSearchChange={setSearch}
                searchPlaceholder="Search prompts..."
              >
                {filteredPrompts.map((prompt) => (
                  <MenuItem
                    key={prompt.name}
                    title={prompt.title || prompt.name}
                    description={prompt.description || prompt.name}
                    selected={selectedPrompt?.name === prompt.name}
                    onClick={() => onPromptSelect(prompt)}
                  />
                ))}
              </MenuPanel>
            </ActionMenuButton>
          </div>

          <div className="flex items-center gap-3">
            <div className="inline-flex max-w-full items-center rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-medium text-zinc-700">
              {selectedLabel}
            </div>

            <button
              onClick={onSend}
              disabled={sending || !input.trim()}
              className="flex items-center gap-2 rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {sending ? (
                "Sending..."
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Send
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
