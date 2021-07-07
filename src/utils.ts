// https://stackoverflow.com/a/51568508
export const inverseColor = (hex: string): string => {
  const match = hex.match(/[a-f0-9]{2}/gi);
  if (!match) throw new Error(`Cannot invert hex "${hex}"`);

  return (
    '#' +
    match
      .map((e) =>
        ((255 - parseInt(e, 16)) | 0)
          .toString(16)
          .replace(/^([a-f0-9])$/, '0$1'),
      )
      .join('')
  );
};

// https://stackoverflow.com/a/1527820
export function randomInt(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// https://stackoverflow.com/a/50718602
function randomHex() {
  const hexNumbers: (string | number)[] = [
    0,
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    9,
    'A',
    'B',
    'C',
    'D',
    'E',
    'F',
  ];
  // picking a random item of the array
  return hexNumbers[Math.floor(Math.random() * hexNumbers.length)];
}

// Generates a Random Hex color
export function hexGenerator() {
  const hexValue: (string | number)[] = ['#'];
  for (let i = 0; i < 6; i += 1) {
    hexValue.push(randomHex());
  }

  return hexValue.join('');
}

export const shortId = (prefix = '') =>
  prefix + '::' + Math.random().toString(25).slice(2, 10);
