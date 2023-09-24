export const convertMsToString = (ms: number) => {
  const divisions = [1000, 60, 60, 24, 7, 4, 12, 52];
  const units = ["ms", "sec", "min", "hr", "day", "week", "month", "year"];
  const arr = [];
  let remainder = ms;
  for (let i = 0; i < divisions.length; i++) {
    const division = divisions[i];
    const unit = units[i];
    const value = remainder % division;
    remainder = Math.floor(remainder / division);
    if (value > 0) {
      arr.push(`${value} ${unit}`);
    }
  }
  return arr.reverse().join(", ");
};
