/* ============================================================
 * Blackjack basic-strategy engine — single source of truth.
 *
 * Used by both the page (browser global `BJ`) and the test suite
 * (Node `require`). The page and strategy.test.js MUST consume this
 * file; never duplicate the strategy logic anywhere else.
 *
 * Rule-aware via the shared `rules` object:
 *   - h17       dealer hits soft 17 (false = stands, S17)
 *   - das       double after split allowed
 *   - surrender late surrender available
 *   - decks/bet/hint/scrollMiss/showChart/showCounts  used by the app only (not strategy)
 * ============================================================ */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api; // Node / CommonJS
  else root.BJ = api;                                                     // browser global
})(typeof self !== 'undefined' ? self : this, function () {

  const DEFAULT_RULES = { h17:false, das:true, surrender:false, decks:6, bet:5, hint:true, scrollMiss:true, showChart:true, showCounts:true };
  const rules = Object.assign({}, DEFAULT_RULES);   // live, mutated by the app's options panel

  function handValue(cards){
    let total=0,aces=0;
    for(const c of cards){total+=c.value;if(c.rank==='A')aces++;}
    while(total>21&&aces>0){total-=10;aces--;}
    return{total,soft:(aces>0&&total<=21)};
  }
  function isPair(cards){return cards.length===2&&cards[0].value===cards[1].value;}

  function hitStand(total,soft,d){
    if(soft){if(total>=19)return'stand';if(total===18)return d<=8?'stand':'hit';return'hit';}
    if(total>=17)return'stand';
    if(total>=13)return d<=6?'stand':'hit';
    if(total===12)return(d>=4&&d<=6)?'stand':'hit';
    return'hit';
  }
  function shouldDouble(total,soft,d){
    if(soft){
      if(total===13||total===14)return d===5||d===6;
      if(total===15||total===16)return d>=4&&d<=6;
      if(total===17||total===18)return d>=3&&d<=6;
      if(total===19)return rules.h17&&d===6;            // A,8 vs 6 only on H17
      return false;
    }
    if(total===9)return d>=3&&d<=6;
    if(total===10)return d>=2&&d<=9;
    if(total===11)return rules.h17?(d>=2&&d<=11):(d>=2&&d<=10);  // vs A only on H17
    return false;
  }
  function shouldSplit(pv,d){
    const das=rules.das;
    switch(pv){
      case 11:return true;
      case 10:return false;
      case 9:return [2,3,4,5,6,8,9].includes(d);
      case 8:return true;
      case 7:return d<=7;
      case 6:return das?(d<=6):(d>=3&&d<=6);
      case 5:return false;
      case 4:return das?(d===5||d===6):false;
      case 3:return das?(d<=7):(d>=4&&d<=7);
      case 2:return das?(d<=7):(d>=4&&d<=7);
    }
    return false;
  }
  function surrenderTotal(total,d){
    if(rules.h17){
      if(total===16&&(d===9||d===10||d===11))return true;
      if(total===15&&(d===10||d===11))return true;
      if(total===17&&d===11)return true;
      return false;
    }
    if(total===16&&(d===9||d===10||d===11))return true;
    if(total===15&&d===10)return true;
    return false;
  }
  function shouldSurrender(cards,d){
    if(!rules.surrender||cards.length!==2)return false;
    const{total,soft}=handValue(cards);
    if(soft)return false;
    if(isPair(cards)&&cards[0].value===8)return rules.h17&&d===11;   // 8,8 vs A on H17; else split
    return surrenderTotal(total,d);
  }
  function optimalAction(cards,d,opts){
    if(opts.canSur&&shouldSurrender(cards,d))return'surrender';
    if(opts.canSpl&&isPair(cards)&&shouldSplit(cards[0].value,d))return'split';
    const{total,soft}=handValue(cards);
    if(opts.canDbl&&cards.length===2&&shouldDouble(total,soft,d))return'double';
    return hitStand(total,soft,d);
  }

  return { DEFAULT_RULES, rules, handValue, isPair, hitStand, shouldDouble, shouldSplit, surrenderTotal, shouldSurrender, optimalAction };
});