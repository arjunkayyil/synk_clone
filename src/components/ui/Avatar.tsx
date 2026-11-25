/**
 * src/components/ui/Avatar.tsx
 * User avatar - shows initials if no image src is given.
 */
import { cn } from "@/lib/utils";

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const COLORS = [
  "bg-blue-700",
  "bg-purple-700",
  "bg-green-700",
  "bg-amber-700",
  "bg-pink-700",
  "bg-teal-700",
];

function colorFor(name: string): string {
  const idx = name.charCodeAt(0) % COLORS.length;
  return COLORS[idx];
}

interface AvatarProps {
  name: string;
  src?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = { sm: "w-6 h-6 text-[10px]", md: "w-8 h-8 text-xs", lg: "w-10 h-10 text-sm" };

export function Avatar({ name, src, size = "md", className }: AvatarProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={cn("rounded-full object-cover", sizes[size], className)}
      />
    );
  }

  return (
    <span
      className={cn(
        "rounded-full flex items-center justify-center font-semibold text-white",
        colorFor(name),
        sizes[size],
        className
      )}
      title={name}
    >
      {getInitials(name)}
    </span>
  );
}
