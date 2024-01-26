export function romanize(num: number) {
  if (isNaN(num)) throw new Error('Provided number is NaN');
  const digits = String(+num).split('');
  const key = [
    '',
    'C',
    'CC',
    'CCC',
    'CD',
    'D',
    'DC',
    'DCC',
    'DCCC',
    'CM',
    '',
    'X',
    'XX',
    'XXX',
    'XL',
    'L',
    'LX',
    'LXX',
    'LXXX',
    'XC',
    '',
    'I',
    'II',
    'III',
    'IV',
    'V',
    'VI',
    'VII',
    'VIII',
    'IX',
  ];
  let roman = '';
  let i = 3;
  while (i--) {
    const digit = digits.pop();
    if (digit) {
      roman = (key[Number(digit) + i * 10] || '') + roman;
    }
  }
  return Array(+digits.join('') + 1).join('M') + roman;
}

const subs: Record<string, string> = {
  V: 'I',
  X: 'I',
  L: 'X',
  C: 'X',
  D: 'C',
  M: 'C',
};

const lookup: Record<string, number> = {
  I: 1,
  V: 5,
  X: 10,
  L: 50,
  C: 100,
  D: 500,
  M: 1000,
};

/**
 * @link https://gist.github.com/briansunter/ec7af91065d79a2f790fcd76a2a08a84
 */
export function romanToInt(romanString: string) {
  let total = 0;

  for (let x = 0; x < romanString.length; x++) {
    const fst = romanString[x];
    const snd = romanString[x + 1];
    if (fst === subs[snd]) {
      total = total + lookup[snd] - lookup[fst];
      x++;
    } else if (!snd) {
      total = total + lookup[fst];
    } else {
      total = total + lookup[fst];
    }
  }
  return total;
}
