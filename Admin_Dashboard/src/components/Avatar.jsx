import { initials } from '../utils/helpers';

// Size is dynamic per usage (36/40/44/48/64/120...), so we generate
// arbitrary-value Tailwind classes (e.g. w-[48px]) instead of inline styles.
// The Tailwind CDN's JIT engine compiles these at runtime just like any other class.
export default function Avatar({ name, photo, size = 44 }) {
  const dimension = `w-[${size}px] h-[${size}px]`;
  const fontSize = `text-[${Math.round(size * 0.35)}px]`;

  if (photo) {
    return (
      <img
        src={photo}
        alt={name}
        className={`${dimension} rounded-full object-cover shrink-0`}
      />
    );
  }

  return (
    <div
      className={`${dimension} ${fontSize} rounded-full bg-brand flex items-center justify-center font-bold text-white shrink-0`}
    >
      {initials(name)}
    </div>
  );
}
