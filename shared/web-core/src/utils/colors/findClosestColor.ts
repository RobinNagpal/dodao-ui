interface Color {
  name: string;
  hex: string;
}

export const predefinedColors: Color[] = [
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Black', hex: '#000000' },
  { name: 'Grey', hex: '#808080' },
  { name: 'Blue', hex: '#0000FF' },
  { name: 'Red', hex: '#FF0000' },
  { name: 'Green', hex: '#008000' },
  { name: 'Orange', hex: '#FFA500' },
  { name: 'Cyan', hex: '#00FFFF' },
  { name: 'Magenta', hex: '#FF00FF' },
  { name: 'Purple', hex: '#800080' },
];

export function hexToRgb(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
}

export function colorDistance(color1: [number, number, number], color2: [number, number, number]): number {
  return Math.sqrt(Math.pow(color1[0] - color2[0], 2) + Math.pow(color1[1] - color2[1], 2) + Math.pow(color1[2] - color2[2], 2));
}

export function findClosestColor(hex: string): string {
  const rgb = hexToRgb(hex);
  let closestColor: Color | null = null;
  let smallestDistance = Number.MAX_VALUE;

  predefinedColors.forEach((predefinedColor) => {
    const predefinedRgb = hexToRgb(predefinedColor.hex);
    const distance = colorDistance(rgb, predefinedRgb);
    if (distance < smallestDistance) {
      smallestDistance = distance;
      closestColor = predefinedColor;
    }
  });

  return closestColor ? (closestColor as Color).name : 'Unknown';
}
