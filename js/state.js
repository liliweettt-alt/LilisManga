/* ===== state.js =====
   Shared variables the whole app uses. Loaded FIRST. */

let manga = [];
let tempDates = [];
let chartProgressInstance = null;
let chartMonthlyInstance = null;
let readingGoal = localStorage.getItem('mangaGoal') || 20;

// Which cards have their Summary & Notes panel open (several can be open at once)
let expandedCards = new Set();