// Avatar — verified photo if we have one, initials-in-circle if not.

type AvatarProps = {
  name: string;
  photoApiUrl?: string;   // /api/photo/[officialId]
  size?: number;
};

const PALETTE = ["#1E3A8A", "#1E40AF", "#1F2937", "#334155", "#475569", "#0F172A"];

function initials(name: string): string {
  const parts = name.split(/\s+/).filter((p) => p && /^[A-Za-z]/.test(p));
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function hashColor(name: string): string {
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return PALETTE[h % PALETTE.length];
}

export function Avatar({ name, photoApiUrl, size = 96 }: AvatarProps) {
  if (photoApiUrl) {
    return (
      <img
        src={photoApiUrl}
        alt={name}
        width={size}
        height={size}
        className="rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className="flex items-center justify-center rounded-full font-semibold text-white"
      style={{
        width: size,
        height: size,
        backgroundColor: hashColor(name),
        fontSize: Math.floor(size * 0.42),
      }}
    >
      {initials(name)}
    </div>
  );
}
