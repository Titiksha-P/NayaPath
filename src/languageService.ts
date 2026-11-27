export type IndicLanguage={name:string;code:string;locale:string};
export const INDIC_LANGUAGES:IndicLanguage[]=[
 {name:'Assamese',code:'as',locale:'as-IN'},{name:'Bengali',code:'bn',locale:'bn-IN'},{name:'Bodo',code:'brx',locale:'brx-IN'},{name:'Dogri',code:'doi',locale:'doi-IN'},{name:'English',code:'en',locale:'en-IN'},{name:'Gujarati',code:'gu',locale:'gu-IN'},{name:'Hindi',code:'hi',locale:'hi-IN'},{name:'Kannada',code:'kn',locale:'kn-IN'},{name:'Kashmiri',code:'ks',locale:'ks-IN'},{name:'Konkani',code:'kok',locale:'kok-IN'},{name:'Maithili',code:'mai',locale:'mai-IN'},{name:'Malayalam',code:'ml',locale:'ml-IN'},{name:'Manipuri (Meitei)',code:'mni',locale:'mni-IN'},{name:'Marathi',code:'mr',locale:'mr-IN'},{name:'Nepali',code:'ne',locale:'ne-IN'},{name:'Odia',code:'or',locale:'or-IN'},{name:'Punjabi',code:'pa',locale:'pa-IN'},{name:'Sanskrit',code:'sa',locale:'sa-IN'},{name:'Santali',code:'sat',locale:'sat-IN'},{name:'Sindhi',code:'sd',locale:'sd-IN'},{name:'Tamil',code:'ta',locale:'ta-IN'},{name:'Telugu',code:'te',locale:'te-IN'},{name:'Urdu',code:'ur',locale:'ur-IN'}
];
export type Extraction<T>={value:T|null;confidence:'high'|'medium'|'low'|'unknown';evidence:string;needsConfirmation:boolean};
export function detectScriptLanguage(text:string):{language:IndicLanguage|null;confidence:'high'|'medium'|'low'}{
 const ranges:[string,RegExp][]=[['hi',/[\u0900-\u097F]/],['mr',/[\u0900-\u097F]/],['sa',/[\u0900-\u097F]/],['mai',/[\u0900-\u097F]/],['doi',/[\u0900-\u097F]/],['ne',/[\u0900-\u097F]/],['bn',/[\u0980-\u09FF]/],['as',/[\u0980-\u09FF]/],['pa',/[\u0A00-\u0A7F]/],['gu',/[\u0A80-\u0AFF]/],['or',/[\u0B00-\u0B7F]/],['ta',/[\u0B80-\u0BFF]/],['te',/[\u0C00-\u0C7F]/],['kn',/[\u0C80-\u0CFF]/],['ml',/[\u0D00-\u0D7F]/],['ur',/[\u0600-\u06FF]/],['ks',/[\u0600-\u06FF]/],['sd',/[\u0600-\u06FF]/],['en',/[A-Za-z]/]];
 const hit=ranges.find(([,r])=>r.test(text));const language=hit?INDIC_LANGUAGES.find(x=>x.code===hit[0])||null:null;
 return {language,confidence:language?'medium':'low'};
}
export function extractHours(text:string):Extraction<number>{
 const match=text.match(/\b(\d{1,2}(?:\.\d)?)\s*(?:hours?|hrs?|घंटे|ଘଣ୍ଟା|ঘণ্টা|மணி|గంటలు|तास|કલાક)\b/i);
 if(!match)return {value:null,confidence:'unknown',evidence:'No explicit number of working hours found.',needsConfirmation:true};
 const value=Number(match[1]);if(value<0||value>24)return {value:null,confidence:'low',evidence:match[0],needsConfirmation:true};
 return {value,confidence:'medium',evidence:match[0],needsConfirmation:true};
}
