export const RANGES_REGEX = /^\s*\d+(\s*-\s*\d+)?\s*(,\s*\d+(\s*-\s*\d+)?\s*)*$/;

export const parseRanges = (value: string) => {
  if (!RANGES_REGEX.test(value)) return [];
  return value
    .split(',')
    .map((range) => range.split('-').map((part) => Number(part.trim())))
    .map((range) => (range.length === 1 ? range[0] : (range as [number, number])));
};

export const resolveRanges = <T>(arr: T[], ranges: string, firstIsOne = true) => {
  const parsedRanges = parseRanges(ranges);

  let result: T[] = [];
  parsedRanges.forEach((range) => {
    if (typeof range === 'number') {
      result = [...result, arr[firstIsOne ? range - 1 : range]];
      return;
    }

    const start = firstIsOne ? range[0] - 1 : range[0];
    const end = range[1];
    result = [...result, ...arr.slice(start, end)];
  });

  return result;
};
