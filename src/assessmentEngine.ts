export type Evidence={attempts:number;correct:number;seconds:number;hints:number;retained?:number};
export type Level='foundation'|'developing'|'applied'|'stretch';
export type Challenge={id:string;skill:string;level:Level;prompt:string;options:string[];answer:number;explanation:string};
export const challengeBank:Challenge[]=[
{id:'b1',skill:'customer discovery',level:'foundation',prompt:'You want to test a home-baking business. What is the safest first step?',options:['Buy a large oven','Ask potential customers what they would buy','Rent a shop'],answer:1,explanation:'Validate a real customer need before committing money.'},
{id:'b2',skill:'customer discovery',level:'developing',prompt:'People like your cake idea but nobody orders. What next?',options:['Treat compliments as demand','Ask what would make them order and at what price','Buy more equipment'],answer:1,explanation:'Willingness to pay is stronger evidence than general encouragement.'},
{id:'b3',skill:'financial judgement',level:'applied',prompt:'A supplier discounts ingredients for 100 orders, but you have tested demand for only 5. What do you do?',options:['Buy all 100','Run a small paid pilot and calculate actual costs','Borrow to secure the discount'],answer:1,explanation:'A small paid pilot limits downside and tests real unit economics.'},
{id:'b4',skill:'financial judgement',level:'stretch',prompt:'Your pilot sells, but delivery makes each order unprofitable. What should you test?',options:['Scale volume and hope','Test price, bundle or pickup changes','Stop tracking costs'],answer:1,explanation:'Change one economic assumption at a time and measure contribution margin.'},
{id:'d1',skill:'digital problem solving',level:'foundation',prompt:'A local shop wants more repeat customers. What should you learn first?',options:['Which customers return and why','Which logo colour is trending','Which expensive software to buy'],answer:0,explanation:'Understand the customer problem before choosing a tool.'},
{id:'d2',skill:'digital problem solving',level:'developing',prompt:'The shop has a customer list but rarely contacts people. What low-cost test could help?',options:['Build a complex app','Send a useful opt-in weekly update and measure replies','Purchase ads immediately'],answer:1,explanation:'A small opt-in test checks usefulness before investment.'},
{id:'d3',skill:'digital problem solving',level:'applied',prompt:'Only 4 of 30 customers respond. What is the best next step?',options:['Message hourly','Ask customers what information is useful and adjust','Assume digital tools never work'],answer:1,explanation:'Use feedback to refine the value proposition.'},
{id:'d4',skill:'digital problem solving',level:'stretch',prompt:'Replies increase but nobody visits. What should you investigate?',options:['The message-to-store journey','Buy more followers','Ignore the gap'],answer:0,explanation:'Find where intent is lost and test that step.'}
];
const levels:Level[]=['foundation','developing','applied','stretch'];
export function chooseNextChallenge(history:Evidence[],bank:Challenge[],completed:string[]=[]):Challenge|null{
 const available=bank.filter(c=>!completed.includes(c.id));if(!available.length)return null;
 const recent=history.slice(-3),accuracy=recent.length?recent.reduce((s,e)=>s+e.correct/Math.max(1,e.attempts),0)/recent.length:0,hints=recent.length?recent.reduce((s,e)=>s+e.hints,0)/recent.length:0,retention=recent.length?recent.reduce((s,e)=>s+(e.retained??0),0)/recent.length:0;
 const target:Level=recent.length>=2&&accuracy>=.8&&hints<=1&&retention>=.5?'applied':recent.length>=2&&accuracy>=.7?'developing':'foundation';
 return available.find(c=>c.level===target)||available.sort((a,b)=>levels.indexOf(a.level)-levels.indexOf(b.level))[0];
}
export function readinessReview(x:{skills:number;applied:boolean;interest:number;financeKnown:boolean;surplus:number|null;savings:number|null;willing:boolean;risk:number}){
 const reasons:string[]=[];if(!x.willing)reasons.push('Your own willingness is not established.');if(x.skills<2||!x.applied)reasons.push('More practical evidence is needed.');if(x.interest<3)reasons.push('Interest is still emerging.');if(!x.financeKnown)reasons.push('Financial information is incomplete; unknown is not zero.');if(x.surplus===null||x.surplus<=0)reasons.push('No reliable monthly surplus has been established.');if(x.savings===null)reasons.push('Emergency savings are unknown.');if(x.risk<2)reasons.push('Choose a lower-risk experiment.');
 const safe=x.willing&&x.skills>=3&&x.applied&&x.interest>=3&&x.financeKnown&&x.surplus!==null&&x.surplus>0&&x.savings!==null&&x.risk>=2;
 return{status:safe?'consider-small-pilot':x.skills?'build-evidence':'explore',reasons} as const;
}