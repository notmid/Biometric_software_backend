// No default background here on purpose — every usage passes its own
// bg-* class via `className`. Hardcoding bg-white here previously caused
// a Tailwind conflict: two background utility classes on one element
// (bg-white from here + bg-brand from a caller) fight for the same
// CSS property, and which one wins depends on stylesheet generation
// order, not the order they appear in JSX. Keeping background fully
// caller-controlled avoids that entirely.
export default function Card({ children, className = '' }) {
  return (
    <div className={`rounded-2xl border border-line ${className}`}>
      {children}
    </div>
  );
}
