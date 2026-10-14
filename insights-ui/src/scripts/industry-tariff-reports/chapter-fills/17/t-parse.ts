import { parseRate, formatPolarityRate, rateDollars, parseRateVariants } from '@/utils/tariff-reports/shipment-duty';
const texts = [
  '3.6606¢/kg less 0.020668¢/kg for each degree under 100 degrees (and fractions of a degree in proportion) but not less than 3.143854¢/kg',
  '4.3817¢/kg less 0.0622005¢ /kg for each degree under 100 degrees (and fractions of a degree in proportion) but not less 2.831562¢ /kg',
  '6.58170¢/kg less 0.0622005¢ /kg for each degree under 100 degrees (and fractions of a degree in proportion) but not less than 5.031562¢ /kg',
];
for (const t of texts) {
  const r = parseRate(t);
  const d = formatPolarityRate(t);
  console.log(JSON.stringify(r), '\n ->', d, '\n reparse', JSON.stringify(parseRate(d!)));
  console.log(
    ' $ at 100',
    rateDollars(r!, 1e4, { kg: 1000 }),
    'at 96',
    rateDollars(r!, 1e4, { kg: 1000 }, 96),
    'at 10',
    rateDollars(r!, 1e4, { kg: 1000 }, 10)
  );
}
console.log(JSON.stringify(parseRateVariants(formatPolarityRate(texts[0])! + ' within quota / 35.74¢/kg above quota')));
