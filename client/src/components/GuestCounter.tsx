export function GuestCounter({ label, value, minimum, maximum, onChange }: { label: string; value: number; minimum: number; maximum: number; onChange: (value: number) => void }) {
  return (
    <div className="guest-counter">
      <span>{label}</span>
      <div className="counter-controls">
        <button type="button" onClick={() => onChange(Math.max(minimum, value - 1))} aria-label={"Decrease " + label}>−</button>
        <strong>{value}</strong>
        <button type="button" disabled={value >= maximum} onClick={() => onChange(Math.min(maximum, value + 1))} aria-label={"Increase " + label}>+</button>
      </div>
    </div>
  );
}
