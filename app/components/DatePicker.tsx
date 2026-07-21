"use client";
import { useState, useRef, useEffect } from "react";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const NAV_BTN: React.CSSProperties = {
  width: 28, height: 28, border: "1px solid var(--line)", borderRadius: 6,
  background: "transparent", cursor: "pointer", display: "flex",
  alignItems: "center", justifyContent: "center", color: "var(--foreground)",
  fontSize: 16, lineHeight: "1",
};

export function DatePicker({ name, required }: { name: string; required?: boolean }) {
  const [value, setValue] = useState("");
  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(() => new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(() => new Date().getMonth());
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, []);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const selectedDate = value ? new Date(value + "T00:00:00") : null;

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array<null>(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  function selectDay(d: number) {
    const m = String(viewMonth + 1).padStart(2, "0");
    const dd = String(d).padStart(2, "0");
    setValue(`${viewYear}-${m}-${dd}`);
    setOpen(false);
  }

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  }

  const displayValue = selectedDate
    ? selectedDate.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
    : "";

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <input type="hidden" name={name} value={value} />
      {required && !value && (
        <input
          tabIndex={-1}
          required
          aria-hidden="true"
          style={{ opacity: 0, position: "absolute", pointerEvents: "none", width: 1, height: 1 }}
          defaultValue=""
        />
      )}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          width: "100%", height: 46, padding: "0 14px",
          fontSize: 14, color: value ? "var(--foreground)" : "var(--muted)",
          background: "var(--panel)", border: "1px solid var(--line)", borderRadius: 8,
          outline: "none", fontFamily: "inherit", boxSizing: "border-box",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          cursor: "pointer",
        }}
      >
        <span>{displayValue || "Pick a date"}</span>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M16 2v4M8 2v4M3 10h18" />
        </svg>
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 6px)", left: 0, zIndex: 50,
          width: 288, background: "var(--panel)", border: "1px solid var(--line)",
          borderRadius: 14, boxShadow: "0 8px 40px rgba(0,0,0,0.11)", padding: 16,
        }}>
          {/* Month nav */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <button type="button" onClick={prevMonth} style={NAV_BTN}>‹</button>
            <span style={{ fontSize: 14, fontWeight: 700 }}>{MONTHS[viewMonth]} {viewYear}</span>
            <button type="button" onClick={nextMonth} style={NAV_BTN}>›</button>
          </div>

          {/* Day headers */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: 6 }}>
            {DAYS.map(d => (
              <div key={d} style={{ textAlign: "center", fontSize: 11, fontWeight: 700, color: "var(--muted)", padding: "2px 0" }}>
                {d}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2 }}>
            {cells.map((d, i) => {
              if (!d) return <div key={i} />;
              const thisDate = new Date(viewYear, viewMonth, d);
              const isSelected = selectedDate?.getTime() === thisDate.getTime();
              const isToday = today.getTime() === thisDate.getTime();
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => selectDay(d)}
                  style={{
                    height: 34, borderRadius: 7, fontSize: 13, cursor: "pointer",
                    border: isToday && !isSelected ? "1.5px solid var(--accent)" : "1px solid transparent",
                    background: isSelected ? "var(--accent)" : "transparent",
                    color: isSelected ? "#07110e" : "var(--foreground)",
                    fontWeight: isSelected || isToday ? 700 : 400,
                  }}
                >
                  {d}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
