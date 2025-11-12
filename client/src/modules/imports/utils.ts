export function timeDiffToPreciseString(diffSec: number): string {
  // const diffSec = dayjs(end).diff(dayjs(start)) / 1000;
  if (diffSec < 60) return `${diffSec.toFixed(3)}s`;
  const m = Math.floor(diffSec / 60);
  const s = (diffSec % 60).toFixed(3);
  return `${m}m ${s}s`;
}
