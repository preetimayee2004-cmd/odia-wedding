import { forwardRef, type ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "gold";

const base =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-7 font-sans text-sm font-medium tracking-wide transition duration-200 ease-silk active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50";

const variants: Record<Variant, string> = {
  primary: "bg-sindoor text-cream-light shadow-[0_8px_20px_-10px_rgb(var(--sindoor)/0.7)] active:bg-sindoor-dark",
  secondary: "border border-sindoor/40 text-sindoor active:bg-sindoor/5",
  // Solid mustard gold (#D4AF37) with dark maroon text, for the RSVP and Blessings forms.
  gold: "bg-[#D4AF37] font-semibold text-[#3A0A0A] shadow-[0_8px_20px_-10px_rgb(150_110_10/0.8)] active:bg-[#C29E2C]",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", className = "", type = "button", ...props }, ref) => (
    <button ref={ref} type={type} className={`${base} ${variants[variant]} ${className}`} {...props} />
  ),
);
Button.displayName = "Button";
