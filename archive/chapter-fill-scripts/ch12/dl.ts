import { downloadHtsJson } from '../../../../../../../../Users/robin/projects/worktrees/chapter-migration-1810-batch1/insights-ui/src/scripts/tariff-calculator/lib/hts-source';
(async () => {
  for (const e of process.argv.slice(2)) {
    try {
      const rows = await downloadHtsJson(`https://www.usitc.gov/sites/default/files/tata/hts/hts_${e}_json.json`);
      console.log(e, rows.filter((r) => /^(1207\.99\.03|1211\.90\.89)/.test(r.htsno ?? '')).map((r) => r.htsno).join(' '));
    } catch (err) { console.log(e, 'ERR', (err as Error).message); }
  }
})();
