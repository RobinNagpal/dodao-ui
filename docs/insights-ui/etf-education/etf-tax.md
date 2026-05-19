# ETF Tax — What to Check Before You Buy

Short page. Three things actually matter: **capital-gains distributions**, **dividend tax treatment**, and **account type**.

## 1. Capital-gains distributions (the "invisible" tax)

When an ETF sells a stock at a profit inside the portfolio, US tax law forces it to pass that realized gain through to shareholders at year-end as a **capital-gains distribution** (separate from the regular dividend). You owe tax on it even if you didn't sell anything and just held the fund.

ETFs largely avoid this through **in-kind redemption**: when a big institutional investor cashes out, the ETF hands them a basket of stocks (the lowest-cost-basis lots) instead of selling for cash, so the unrealized gain walks out the door without becoming a taxable event. Result: most broad US-equity ETFs distribute **$0 in capital gains** year after year. Vanguard reports that 82% of its ETFs had no capital-gains distributions over the last 5 years.

**Note on how it reaches you:** the ETF doesn't withhold tax. It pays the distribution to you in cash (alongside dividends), reports it on **Form 1099-DIV** (capital gains in Box 2a, dividends in Boxes 1a / 1b), and you pay the IRS yourself when you file your 1040.

**Where the in-kind trick breaks down:**
- Bond ETFs and REIT ETFs — their return is mostly interest / non-qualified dividends, which in-kind doesn't suppress.
- Brand-new ETFs (years 1–2) — not enough cost-basis variety yet.
- ETFs that change their underlying index — forced selling triggers a one-off distribution.
- Leveraged / inverse ETFs, futures-based commodity ETFs — derivative-driven, can't use in-kind.

## 2. Dividend tax — qualified vs. non-qualified

What the ETF pays you as a regular dividend is taxed two ways:
- **Qualified dividends** — taxed at the lower long-term capital-gains rate (0% / 15% / 20%). Requires you held the ETF > 60 days and the underlying stocks paid US-corp / treaty-country dividends.
- **Non-qualified (ordinary) dividends** — taxed at your full ordinary-income rate. This covers most REIT distributions, bond interest, MLP payouts, and dividends from short-held stocks.

Funds that **pay dividends often** (monthly distributors, REIT ETFs, high-yield bond ETFs, dividend-focused ETFs like SCHD/VYM/HDV) produce a steady ordinary-income stream. That's fine in a tax-sheltered account but is a real drag in a taxable account, especially at higher tax brackets. The ETF's 1099-DIV breaks it out: **Box 1a** = total ordinary dividends, **Box 1b** = qualified portion (the lower-taxed slice).

## 3. Account type — taxable vs. tax-advantaged

Where you hold the ETF matters more than which ETF you pick:

| Account type | Tax treatment | Best holdings |
|---|---|---|
| **Taxable brokerage** | Pay tax every year on distributions + when you sell | Tax-efficient US-equity ETFs (low/zero cap-gain distribs, mostly qualified dividends) |
| **Traditional IRA / 401(k)** | No tax inside the account; taxed as ordinary income on withdrawal | Bond ETFs, REIT ETFs, high-turnover or high-dividend ETFs |
| **Roth IRA / Roth 401(k)** | After-tax in, no tax inside, **no tax on withdrawal** | Your highest-expected-return ETFs (small-cap, emerging markets, aggressive growth) |
| **HSA** | Triple tax-advantaged (deduction + growth + qualified-medical withdrawal) | Same as Roth — long-horizon growth |
| **529 plan** | No tax on growth if used for qualified education | Age-based glide-path ETFs |

This is **"asset location."** A REIT ETF in a Roth IRA pays $0 in taxes for life. The same ETF in a taxable account loses 30%+ of its yield to ordinary-income tax every year. The right ETF in the wrong account is a much bigger leak than picking the wrong ETF.

## Where to check before you buy

1. **Issuer's fund page → Distributions / Tax tab.** Look for the **Capital Gains** column over the last 5 years. If it's $0.00 every year, you're in the 82%-of-Vanguard-ETFs club. Same page shows ordinary vs. qualified dividend split.
2. **Morningstar (`morningstar.com/etfs/<ticker>`) → Tax tab.** Two numbers worth knowing:
   - **Tax-Cost Ratio** — % of return lost to taxes for a top-bracket investor. < 0.5% is excellent.
   - **Potential Capital Gains Exposure** — embedded unrealized gains. Negative = future cap-gain distributions essentially impossible.
3. **The ETF's annual report (issuer site or SEC EDGAR).** "Capital gain distributions" line in financial highlights + "capital loss carryforwards" note.
4. **Your own 1099-DIV after year 1.** Box 2a (cap gains), Box 1a / 1b (ordinary / qualified dividends), Box 3 (return-of-capital) — confirms what actually happened.

## Quick rules of thumb
- **Broad US-equity ETF (VTI / VOO / SCHB / ITOT):** very tax-efficient. Safe in any account, ideal in taxable.
- **International / EM equity ETF:** mostly tax-efficient; foreign tax credit possible in taxable account (lost in IRA).
- **Bond ETF, REIT ETF, high-yield ETF, MLP ETF:** tax-inefficient — prefer IRA / 401(k) / Roth.
- **Leveraged / inverse / futures-based / single-country active ETF:** watch for one-off distributions; check the last 5 years before buying.
