# Omex Courier & Logistics Api Server

Node version: `6.9.5`

# Temporary scripts for data management

# Branch summary adjustments

- Starts from `BRANCH_SUMMARY_START_DATE` as set in `./config/moduleSettings.js`
- `./scripts/populateBranchTransactionHistories.js` -> `populateForDate()`
  populates the historical entry for the given date if not present
- `./scripts/populateBranchTransactionHistories.js` -> `populateFromStart()`
  populates the historical entries from start date
- `./scripts/populateBranchTransactionHistories.js` -> `calculateClosingBalanceFromStart()`
  cumulatively updates closing balances from start date
