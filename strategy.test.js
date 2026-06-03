/* Strategy engine tests. Run: node strategy.test.js
 * Exits non-zero on any failure so Claude Code / CI can gate on it. */
const BJ = require('./strategy.js');
const { rules, DEFAULT_RULES, handValue, optimalAction } = BJ;

let pass = 0, fail = 0;
function set(o){ Object.assign(rules, DEFAULT_RULES, o || {}); }   // reset to defaults, then override
function eq(name, got, exp){
  if (got === exp) { pass++; }
  else { fail++; console.log('FAIL  ' + name + '  => ' + got + '  (expected ' + exp + ')'); }
}

const card = (v, r) => ({ value: v, rank: r || String(v) });
const A = () => card(11, 'A');
// optimal action for a fresh two-card hand under the current rules
function best(cards, d){
  return optimalAction(cards, d, {
    canDbl: cards.length === 2,
    canSpl: cards.length === 2 && cards[0].value === cards[1].value,
    canSur: rules.surrender && cards.length === 2
  });
}

/* ---- handValue ---- */
eq('handValue A,8 total',   handValue([A(), card(8)]).total, 19);
eq('handValue A,8 soft',    handValue([A(), card(8)]).soft, true);
eq('handValue A,A,9 total', handValue([A(), A(), card(9)]).total, 21);   // 11+1+9
eq('handValue 10,6,K bust', handValue([card(10), card(6), card(10,'K')]).total, 26);
eq('handValue hard after ace demote', handValue([A(), card(7), card(10)]).total, 18);

/* ---- hard hit/stand & double (S17 default) ---- */
set();
eq('hard 16 v10',  best([card(10), card(6)], 10), 'hit');
eq('hard 13 v2',   best([card(10), card(3)], 2),  'stand');
eq('hard 12 v3',   best([card(10), card(2)], 3),  'hit');
eq('hard 12 v4',   best([card(10), card(2)], 4),  'stand');
eq('hard 11 vA S17', best([card(6), card(5)], 11), 'hit');
eq('hard 10 v9',   best([card(6), card(4)], 9),  'double');
eq('hard 9 v2',    best([card(5), card(4)], 2),  'hit');
eq('hard 9 v3',    best([card(5), card(4)], 3),  'double');

/* ---- soft (S17 default) ---- */
eq('soft 18 v2',   best([A(), card(7)], 2),  'stand');
eq('soft 18 v9',   best([A(), card(7)], 9),  'hit');
eq('soft 18 v4',   best([A(), card(7)], 4),  'double');
eq('soft 13 v5',   best([A(), card(2)], 5),  'double');
eq('soft 19 v6 S17', best([A(), card(8)], 6), 'stand');

/* ---- H17 deltas ---- */
set({ h17: true });
eq('hard 11 vA H17',  best([card(6), card(5)], 11), 'double');
eq('soft 19 v6 H17',  best([A(), card(8)], 6), 'double');

/* ---- pairs / DAS ---- */
set();
eq('A,A always split', best([A(), A()], 10), 'split');
eq('8,8 v10 split',    best([card(8), card(8)], 10), 'split');
eq('10,10 v6 stand',   best([card(10), card(10,'K')], 6), 'stand');
eq('5,5 v6 double',    best([card(5), card(5)], 6), 'double');
eq('4,4 v5 DAS split', best([card(4), card(4)], 5), 'split');
set({ das: false });
eq('4,4 v5 noDAS hit', best([card(4), card(4)], 5), 'hit');
eq('2,2 v3 noDAS hit', best([card(2), card(2)], 3), 'hit');
eq('6,6 v2 noDAS hit', best([card(6), card(6)], 2), 'hit');

/* ---- late surrender ---- */
set({ surrender: true });                 // S17
eq('LS S17 16 v10', best([card(10), card(6)], 10), 'surrender');
eq('LS S17 15 v10', best([card(10), card(5)], 10), 'surrender');
eq('LS S17 16 v9',  best([card(10), card(6)], 9),  'surrender');
eq('LS S17 16 v7',  best([card(10), card(6)], 7),  'hit');
eq('LS S17 8,8 v10 still split', best([card(8), card(8)], 10), 'split');
set({ surrender: true, h17: true });      // H17
eq('LS H17 15 vA', best([card(10), card(5)], 11), 'surrender');
eq('LS H17 17 vA', best([card(10), card(7)], 11), 'surrender');
eq('LS H17 8,8 vA surrender', best([card(8), card(8)], 11), 'surrender');
eq('LS H17 8,8 v10 split',    best([card(8), card(8)], 10), 'split');

set();  // leave defaults restored
console.log('\n' + pass + '/' + (pass + fail) + ' passed' + (fail ? '  — ' + fail + ' FAILED' : ''));
process.exit(fail ? 1 : 0);