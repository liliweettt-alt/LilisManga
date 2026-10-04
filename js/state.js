/* ===== state.js =====
   Shared variables the whole app uses. Loaded FIRST. */

let manga = [];
let tempDates = [];
let chartProgressInstance = null;
let chartMonthlyInstance = null;
let readingGoal = localStorage.getItem('mangaGoal') || 20;
