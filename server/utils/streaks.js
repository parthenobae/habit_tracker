export function getStreakStats(completionDates = [], today = new Date().toISOString().slice(0, 10)) {
  const dates = new Set(completionDates);
  const shift = (date, amount) => {
    const d = new Date(`${date}T12:00:00Z`);
    d.setUTCDate(d.getUTCDate() + amount);
    return d.toISOString().slice(0, 10);
  };

  let current = 0;
  let cursor = dates.has(today) ? today : shift(today, -1);
  while (dates.has(cursor)) {
    current++;
    cursor = shift(cursor, -1);
  }

  const sorted = [...dates].sort();
  let longest = 0, run = 0, previous = null;
  for (const date of sorted) {
    run = previous && shift(previous, 1) === date ? run + 1 : 1;
    longest = Math.max(longest, run);
    previous = date;
  }
  return { currentStreak: current, longestStreak: longest };
}
