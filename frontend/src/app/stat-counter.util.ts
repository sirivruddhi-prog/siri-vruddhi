export interface AnimatedStat {
  label: string;
  raw: string;
  display: string;
}

/** Parse venue stats like "200+", "300-500", "60+" into animatable numeric parts. */
export function buildAnimatedStats(items: { value: string; label: string }[]): AnimatedStat[] {
  return items.map((item) => ({
    label: item.label,
    raw: item.value,
    display: item.value,
  }));
}

export function animateStatValue(
  raw: string,
  durationMs: number,
  onUpdate: (value: string) => void,
  onDone?: () => void
): void {
  const rangeMatch = raw.match(/^(\d+)\s*-\s*(\d+)(.*)$/);
  const plusMatch = raw.match(/^(\d+)(\+.*)$/);
  const plainMatch = raw.match(/^(\d+)(.*)$/);

  const start = performance.now();
  const tick = (now: number) => {
    const t = Math.min(1, (now - start) / durationMs);
    const eased = 1 - Math.pow(1 - t, 3);

    if (rangeMatch) {
      const a = Math.round(Number(rangeMatch[1]) * eased);
      const b = Math.round(Number(rangeMatch[2]) * eased);
      onUpdate(`${a}-${b}${rangeMatch[3] || ''}`);
    } else if (plusMatch) {
      const n = Math.round(Number(plusMatch[1]) * eased);
      onUpdate(`${n}${plusMatch[2]}`);
    } else if (plainMatch) {
      const n = Math.round(Number(plainMatch[1]) * eased);
      onUpdate(`${n}${plainMatch[2] || ''}`);
    } else {
      onUpdate(raw);
    }

    if (t < 1) {
      requestAnimationFrame(tick);
    } else {
      onUpdate(raw);
      onDone?.();
    }
  };

  requestAnimationFrame(tick);
}
