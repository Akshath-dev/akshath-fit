import type { FormEvent } from "react";
import { ErrorNotice, Button } from "./Ui";
import { useEntrySave } from "./EntrySheet";
export function ConfirmDelete({
  label,
  onDelete,
  onCancel,
}: {
  label: string;
  onDelete: () => Promise<void>;
  onCancel: () => void;
}) {
  const save = useEntrySave();
  return (
    <form
      className="entry-form"
      onSubmit={(e: FormEvent) => {
        e.preventDefault();
        void save.submit(onDelete);
      }}
    >
      <p className="form-hint">
        Delete {label}? This removes the saved record.
      </p>
      {save.error && <ErrorNotice message={save.error} />}
      <div className="entry-actions">
        <Button
          type="button"
          variant="ghost"
          disabled={save.busy}
          onClick={onCancel}
        >
          Keep entry
        </Button>
        <Button type="submit" variant="danger" disabled={save.busy}>
          {save.busy ? "Deleting…" : "Delete entry"}
        </Button>
      </div>
    </form>
  );
}
