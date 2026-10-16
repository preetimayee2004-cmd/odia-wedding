import { useId, type ReactElement, cloneElement } from "react";

// 16px text stops iOS Safari zooming into fields on focus.
export const controlClass =
  "w-full rounded-xl border border-gold/55 bg-cream-light px-4 py-3 text-base text-ink placeholder:text-ink-soft/60 transition-colors duration-200 focus:border-sindoor focus:outline-none focus:ring-2 focus:ring-sindoor/15 aria-[invalid=true]:border-sindoor";

interface FieldProps {
  label: string;
  error?: string | null;
  hint?: string;
  /** A single input/textarea/select; id and aria wiring are added here. */
  children: ReactElement;
  optional?: boolean;
}

/** Label + control + hint/error, accessibly wired together. */
export function Field({ label, error, hint, children, optional }: FieldProps) {
  const id = useId();
  const describedBy = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(" ") || undefined;

  return (
    <div className="text-left">
      <label htmlFor={id} className="t-label mb-1.5 block">
        {label}
        {optional && <span className="ml-1 normal-case tracking-normal text-ink-soft/80">(optional)</span>}
      </label>
      {cloneElement(children, { id, "aria-invalid": error ? true : undefined, "aria-describedby": describedBy })}
      {hint && !error && (
        <p id={`${id}-hint`} className="t-note mt-1">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="t-note mt-1 font-medium text-sindoor">
          {error}
        </p>
      )}
    </div>
  );
}

/** Off-screen trap field: people never see it, simple bots fill it in. */
export function Honeypot({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
      <label>
        Leave this empty
        <input tabIndex={-1} autoComplete="off" name="website" value={value} onChange={(e) => onChange(e.target.value)} />
      </label>
    </div>
  );
}
