import { useEffect, useRef, useState } from 'react';
import { AudioLines, Check, ChevronRight, Mic, MicOff, Pause, Play, RotateCcw, Volume2 } from 'lucide-react';

type Lang = { name:string; locale:string; prompts:string[]; yes:string[]; no:string[] };
const supported:Lang[] = [
 {name:'English',locale:'en-IN',yes:['yes','yeah','correct','right'],no:['no','wrong','incorrect'],prompts:['Welcome to NayaPath. We will talk one step at a time. You can say skip whenever you do not want to answer.','What work do you currently do?','What would you like help with: better income in your current work, additional income, starting a business, or learning skills for a different opportunity?','About how many hours do you usually work each day?','How many days off do you usually have each week?','After work, do you usually feel energetic, a little tired, or exhausted and in need of rest?','Tell me about the skills and tasks you know from work or daily life.','Which city or district do you live or work in?','Does your employer or work agreement require permission for outside work, or restrict it? Say yes, no, or not sure.','I heard: {answer}. Is that correct? Say yes or no.','Thank you. I have saved the answers you confirmed. You can review your opportunity map now.']},
 {name:'Hindi',locale:'hi-IN',yes:['हाँ','हां','जी','सही','ठीक','हाँ सही'],no:['नहीं','गलत'],prompts:['नमस्ते! NayaPath में आपका स्वागत है। हम एक-एक सवाल पूछेंगे। किसी सवाल का जवाब नहीं देना हो तो आप छोड़ सकते हैं।','आप अभी कौन सा काम करते हैं?','आप क्या चाहते हैं: मौजूदा काम में बेहतर कमाई, अतिरिक्त कमाई, अपना व्यवसाय शुरू करना, या नए कौशल सीखना?','आप आमतौर पर रोज़ कितने घंटे काम करते हैं?','आपको हफ्ते में कितने दिन छुट्टी मिलती है?','काम के बाद आप कैसा महसूस करते हैं: ऊर्जा रहती है, थोड़ी थकान होती है, या बहुत थक जाते हैं?','आप अपने काम या रोज़मर्रा के जीवन में कौन-कौन से काम और कौशल जानते हैं?','आप किस शहर या ज़िले में रहते या काम करते हैं?','क्या बाहर का काम करने के लिए आपके मालिक की अनुमति ज़रूरी है, या कोई रोक है? हाँ, नहीं या पता नहीं कहें।','मैंने सुना: {answer}। क्या यह सही है? हाँ या नहीं कहें।','धन्यवाद। आपके बताए और पुष्टि किए गए जवाब सुरक्षित कर लिए हैं। अब आप अपने अवसर देख सकते हैं।']},
 {name:'Odia',locale:'or-IN',yes:['ହଁ','ହଁ ଠିକ୍','ଠିକ୍','ସଠିକ୍'],no:['ନା','ନାହିଁ','ଭୁଲ'],prompts:['ନମସ୍କାର! NayaPath କୁ ସ୍ୱାଗତ। ଆମେ ଗୋଟିଏ ପରେ ଗୋଟିଏ ପ୍ରଶ୍ନ ପଚାରିବୁ। ଉତ୍ତର ଦେବାକୁ ଇଚ୍ଛା ନଥିଲେ ଛାଡ଼ିପାରିବେ।','ଆପଣ ବର୍ତ୍ତମାନ କେଉଁ କାମ କରୁଛନ୍ତି?','ଆପଣ କଣ ଚାହୁଁଛନ୍ତି: ବର୍ତ୍ତମାନ କାମରେ ଅଧିକ ଆୟ, ଅତିରିକ୍ତ ଆୟ, ନିଜ ବ୍ୟବସାୟ, ନା ନୂଆ କୌଶଳ ଶିଖିବା?','ଆପଣ ସାଧାରଣତଃ ପ୍ରତିଦିନ କେତେ ଘଣ୍ଟା କାମ କରନ୍ତି?','ସପ୍ତାହରେ ସାଧାରଣତଃ କେତେ ଦିନ ଛୁଟି ମିଳେ?','କାମ ପରେ ଆପଣଙ୍କୁ କେମିତି ଲାଗେ: ଶକ୍ତି ରହେ, ଟିକେ ଥକା ଲାଗେ, ନା ବହୁତ ଥକିଯାଆନ୍ତି?','ଆପଣଙ୍କ କାମ କିମ୍ବା ଦୈନନ୍ଦିନ ଜୀବନରେ କେଉଁ କୌଶଳ ଓ କାମ ଜାଣିଛନ୍ତି?','ଆପଣ କେଉଁ ସହର କିମ୍ବା ଜିଲ୍ଲାରେ ରୁହନ୍ତି କିମ୍ବା କାମ କରନ୍ତି?','ଅନ୍ୟ କାମ କରିବାକୁ ମାଲିକଙ୍କ ଅନୁମତି ଦରକାର କିମ୍ବା କୌଣସି ନିୟମରେ ମନା ଅଛି କି? ହଁ, ନା କିମ୍ବା ଜାଣିନାହିଁ କୁହନ୍ତୁ।','ମୁଁ ଶୁଣିଲି: {answer}। ଏହା ଠିକ୍ କି? ହଁ କିମ୍ବା ନା କୁହନ୍ତୁ।','ଧନ୍ୟବାଦ। ଆପଣ ନିଶ୍ଚିତ କରିଥିବା ଉତ୍ତରଗୁଡ଼ିକ ରଖାଯାଇଛି। ଏବେ ଆପଣ ନିଜ ସୁଯୋଗ ଦେଖିପାରିବେ।']},
 {name:'Bengali',locale:'bn-IN',yes:['হ্যাঁ','ঠিক','ঠিক আছে'],no:['না','ভুল'],prompts:['নমস্কার! NayaPath-এ স্বাগতম। আমরা একবারে একটি প্রশ্ন করব। উত্তর দিতে না চাইলে বলতে পারেন, বাদ দিন।','আপনি এখন কী কাজ করেন?','আপনি কী চান: বর্তমান কাজে বেশি আয়, অতিরিক্ত আয়, নিজের ব্যবসা, নাকি নতুন দক্ষতা শেখা?','আপনি সাধারণত প্রতিদিন কত ঘণ্টা কাজ করেন?','সপ্তাহে সাধারণত কত দিন ছুটি পান?','কাজের পরে আপনার কেমন লাগে: শক্তি থাকে, একটু ক্লান্ত লাগে, নাকি খুব ক্লান্ত হয়ে বিশ্রাম দরকার হয়?','আপনার কাজ বা দৈনন্দিন জীবনে কী কী দক্ষতা ও কাজ জানেন?','আপনি কোন শহর বা জেলায় থাকেন বা কাজ করেন?','অন্য কাজ করতে কি মালিকের অনুমতি লাগে, অথবা কোনো নিয়মে বাধা আছে? হ্যাঁ, না বা জানি না বলুন।','আমি শুনেছি: {answer}। এটা কি ঠিক? হ্যাঁ বা না বলুন।','ধন্যবাদ। আপনার নিশ্চিত করা উত্তরগুলো রাখা হয়েছে। এখন আপনি আপনার সুযোগগুলো দেখতে পারেন।']},
 {name:'Tamil',locale:'ta-IN',yes:['ஆம்','சரி','ஆமாம்'],no:['இல்லை','தவறு'],prompts:['வணக்கம்! NayaPath-க்கு வரவேற்கிறோம். ஒவ்வொரு முறையும் ஒரு கேள்வி கேட்போம். பதில் சொல்ல விருப்பமில்லை என்றால் தவிர்க்கலாம்.','நீங்கள் இப்போது என்ன வேலை செய்கிறீர்கள்?','உங்களுக்கு எது வேண்டும்: தற்போதைய வேலையில் அதிக வருமானமா, கூடுதல் வருமானமா, சொந்தத் தொழிலா, அல்லது புதிய திறன்களைக் கற்றுக்கொள்வதா?','நீங்கள் வழக்கமாக ஒரு நாளில் எத்தனை மணி நேரம் வேலை செய்கிறீர்கள்?','ஒரு வாரத்தில் பொதுவாக எத்தனை நாட்கள் விடுமுறை கிடைக்கும்?','வேலைக்குப் பிறகு உங்களுக்கு எப்படி இருக்கும்: சுறுசுறுப்பாகவா, கொஞ்சம் சோர்வாகவா, அல்லது மிகவும் சோர்வாக ஓய்வு தேவைப்படுமா?','உங்கள் வேலை அல்லது அன்றாட வாழ்க்கையில் உங்களுக்கு என்ன திறன்கள் உள்ளன?','நீங்கள் எந்த நகரம் அல்லது மாவட்டத்தில் வசிக்கிறீர்கள் அல்லது வேலை செய்கிறீர்கள்?','வேறு வேலை செய்ய முதலாளியின் அனுமதி தேவையா அல்லது ஏதேனும் தடை உள்ளதா? ஆம், இல்லை அல்லது தெரியாது என்று சொல்லுங்கள்.','நான் கேட்டது: {answer}. இது சரியா? ஆம் அல்லது இல்லை என்று சொல்லுங்கள்.','நன்றி. நீங்கள் உறுதிப்படுத்திய பதில்களைச் சேமித்துள்ளோம். இப்போது உங்கள் வாய்ப்புகளைப் பார்க்கலாம்.']},
 {name:'Telugu',locale:'te-IN',yes:['అవును','సరే','కరెక్ట్'],no:['కాదు','తప్పు','లేదు'],prompts:['నమస్కారం! NayaPath కు స్వాగతం. మేము ఒక్కో ప్రశ్న అడుగుతాము. సమాధానం చెప్పకూడదనుకుంటే దాటవేయవచ్చు.','మీరు ప్రస్తుతం ఏ పని చేస్తున్నారు?','మీకు ఏది కావాలి: ప్రస్తుత పనిలో మెరుగైన ఆదాయం, అదనపు ఆదాయం, స్వంత వ్యాపారం, లేదా కొత్త నైపుణ్యాలు నేర్చుకోవడమా?','మీరు సాధారణంగా రోజుకు ఎన్ని గంటలు పని చేస్తారు?','వారానికి సాధారణంగా ఎన్ని రోజులు సెలవు ఉంటుంది?','పని తర్వాత మీకు ఎలా అనిపిస్తుంది: ఉత్సాహంగా ఉంటారా, కొంచెం అలసటగా ఉంటుందా, లేక చాలా అలసిపోయి విశ్రాంతి అవసరమా?','మీ పని లేదా రోజువారీ జీవితంలో మీకు ఏ నైపుణ్యాలు ఉన్నాయి?','మీరు ఏ నగరం లేదా జిల్లాలో ఉంటారు లేదా పని చేస్తారు?','బయట పని చేయడానికి యజమాని అనుమతి అవసరమా లేదా ఏదైనా నిబంధన అడ్డుకుంటుందా? అవును, కాదు లేదా తెలియదు అని చెప్పండి.','నేను విన్నది: {answer}. ఇది సరైనదేనా? అవును లేదా కాదు అని చెప్పండి.','ధన్యవాదాలు. మీరు నిర్ధారించిన సమాధానాలు భద్రపరిచాం. ఇప్పుడు మీ అవకాశాలను చూడవచ్చు.']},
 {name:'Marathi',locale:'mr-IN',yes:['हो','बरोबर','होय'],no:['नाही','चूक'],prompts:['नमस्कार! NayaPath मध्ये आपले स्वागत आहे. आम्ही एका वेळी एक प्रश्न विचारू. उत्तर द्यायचे नसेल तर वगळू शकता.','तुम्ही सध्या कोणते काम करता?','तुम्हाला काय हवे आहे: सध्याच्या कामात अधिक उत्पन्न, अतिरिक्त उत्पन्न, स्वतःचा व्यवसाय, की नवीन कौशल्ये शिकायची आहेत?','तुम्ही साधारणपणे दररोज किती तास काम करता?','आठवड्यात साधारण किती दिवस सुट्टी मिळते?','कामानंतर तुम्हाला कसे वाटते: ऊर्जा असते, थोडा थकवा असतो, की खूप थकून विश्रांतीची गरज असते?','तुमच्या कामात किंवा दैनंदिन जीवनात कोणती कौशल्ये आहेत?','तुम्ही कोणत्या शहरात किंवा जिल्ह्यात राहता किंवा काम करता?','दुसरे काम करण्यासाठी मालकाची परवानगी लागते का किंवा काही नियम अडथळा आणतात का? हो, नाही किंवा माहीत नाही असे सांगा.','मी ऐकले: {answer}. हे बरोबर आहे का? हो किंवा नाही सांगा.','धन्यवाद. तुम्ही निश्चित केलेली उत्तरे जतन केली आहेत. आता तुमच्या संधी पाहू शकता.']},
 {name:'Gujarati',locale:'gu-IN',yes:['હા','બરાબર','સાચું'],no:['ના','ખોટું'],prompts:['નમસ્તે! NayaPath માં આપનું સ્વાગત છે. અમે એક સમયે એક પ્રશ્ન પૂછીશું. જવાબ ન આપવો હોય તો છોડી શકો છો.','તમે હાલમાં કયું કામ કરો છો?','તમારે શું જોઈએ છે: હાલના કામમાં વધુ આવક, વધારાની આવક, પોતાનો વ્યવસાય, કે નવી કુશળતા શીખવી?','તમે સામાન્ય રીતે દરરોજ કેટલા કલાક કામ કરો છો?','અઠવાડિયામાં સામાન્ય રીતે કેટલા દિવસ રજા મળે છે?','કામ પછી તમને કેવું લાગે છે: ઊર્જા રહે છે, થોડો થાક લાગે છે, કે ખૂબ થાકીને આરામની જરૂર પડે છે?','તમારા કામ અથવા રોજિંદા જીવનમાં કઈ કુશળતા છે?','તમે કયા શહેર અથવા જિલ્લામાં રહો છો અથવા કામ કરો છો?','બીજું કામ કરવા માટે માલિકની મંજૂરી જરૂરી છે કે કોઈ નિયમ રોકે છે? હા, ના અથવા ખબર નથી કહો.','મેં સાંભળ્યું: {answer}. શું આ સાચું છે? હા અથવા ના કહો.','આભાર. તમે ખાતરી કરેલા જવાબો સાચવ્યા છે. હવે તમે તમારી તકો જોઈ શકો છો.']}
];
const labels = ['Welcome','Occupation','Goal','Working hours','Days off','Energy','Skills','Location','Work restrictions'];
type Values = {occupation:string;goal:string;hours:string;daysOff:string;energy:string;skills:string;location:string;contract:string};
const initial:Values={occupation:'',goal:'extra',hours:'',daysOff:'',energy:'',skills:'',location:'',contract:'unknown'};
type Props={onComplete:(values:Values,locale:string)=>void};
export default function VoiceOnboarding({onComplete}:Props){
 const [lang,setLang]=useState(supported[0]);
 const [step,setStep]=useState(-1);
 const [listening,setListening]=useState(false);
 const [speaking,setSpeaking]=useState(false);
 const [transcript,setTranscript]=useState('');
 const [pending,setPending]=useState('');
 const [values,setValues]=useState<Values>(initial);
 const [message,setMessage]=useState('Choose a supported language, then press Start. Voice support depends on the browser and device.');
 const [error,setError]=useState('');
 const recognition=useRef<any>(null);
 const valuesRef=useRef(values);
 useEffect(()=>{valuesRef.current=values;},[values]);
 const stopSpeech=()=>{if('speechSynthesis' in window) window.speechSynthesis.cancel();setSpeaking(false);};
 const say=(text:string)=>{if(!('speechSynthesis' in window)){setError('Speech playback is not available in this browser.');return;}stopSpeech();const utterance=new SpeechSynthesisUtterance(text);utterance.lang=lang.locale;utterance.rate=0.88;utterance.onstart=()=>setSpeaking(true);utterance.onend=()=>setSpeaking(false);utterance.onerror=()=>{setSpeaking(false);setError('Your device does not have a usable voice for this language.');};window.speechSynthesis.speak(utterance);};
 const prompt=(index:number,answer='')=>{const raw=lang.prompts[index]||lang.prompts[0];return raw.replace('{answer}',answer);};
 const startListening=(confirmation=false)=>{
  const SR=(window as any).SpeechRecognition||(window as any).webkitSpeechRecognition;
  if(!SR){setError('Speech recognition is unavailable in this browser. Try Chrome on Android or a supported desktop browser.');return;}
  stopSpeech();setError('');
  const rec=new SR();recognition.current=rec;rec.lang=lang.locale;rec.continuous=false;rec.interimResults=false;rec.maxAlternatives=1;
  rec.onstart=()=>{setListening(true);setMessage(confirmation?'Please say yes or no.':'Listening. Speak naturally in your selected language.');};
  rec.onerror=(e:any)=>{setListening(false);setError(e.error==='not-allowed'?'Microphone permission was denied. Allow microphone access and try again.':e.error==='language-not-supported'?'This browser does not support speech recognition for this language.':'I could not hear that clearly. Please try again.');};
  rec.onend=()=>setListening(false);
  rec.onresult=(e:any)=>{const text=String(e.results?.[0]?.[0]?.transcript||'').trim();setTranscript(text);if(confirmation) handleConfirmation(text);else{setPending(text);say(prompt(9,text));setMessage('Please confirm what I heard.');}};
  try{rec.start();}catch{setListening(false);setError('The microphone could not start. Please try again.');}
 };
 const parse=(index:number,text:string):Partial<Values>=>{
  const t=text.toLowerCase();
  if(index===1)return {occupation:text};
  if(index===2){if(/business|व्यवसाय|व्यापार|ବ୍ୟବସାୟ|ব্যবসা|தொழில்|వ్యాపారం|धंदा|ધંધો/.test(t))return {goal:'business'};if(/skill|learn|कौशल|सीख|ଦକ୍ଷତା|ଶିଖ|দক্ষতা|শিখ|திறன்|கற்க|నైపుణ్య|నేర్చ|कौशल्य|शिक|કૌશલ્ય|શીખ/.test(t))return {goal:'skills'};if(/better|अधिक|ज्यादा|बेहतर|ଅଧିକ|ভালো|বেশি|மேலும்|మెరుగైన|अधिक|વધુ/.test(t))return {goal:'better'};return {goal:'extra'};}
  if(index===3){const n=text.match(/\d+(?:\.\d+)?/);return n?{hours:String(Math.min(18,Math.max(0,Number(n[0]))))}:{};}
  if(index===4){const n=text.match(/\d+/);if(n)return {daysOff:String(Math.min(7,Math.max(0,Number(n[0]))))};if(/no|none|नहीं|କିଛି ନାହିଁ|নেই|இல்லை|లేదు/.test(t))return {daysOff:'0'};return {};}
  if(index===5){if(/exhaust|very tired|बहुत थक|थक जाता|କ୍ଲାନ୍ତ|ବହୁତ ଥକ|খুব ক্লান্ত|மிகவும் சோர்வு|చాలా అలసట|खूप थक|ખૂબ થાક/.test(t))return {energy:'exhausted'};if(/tired|little|थोड़ा|थकान|ଟିକେ ଥକ|ক্লান্ত|சோர்வு|అలసట|थकवा|થાક/.test(t))return {energy:'low'};if(/energy|fine|good|ठीक|अच्छा|ऊर्जा|ଭଲ|ଶକ୍ତି|ভালো|சுறுசுறுப்பு|బాగుంది|चांगले|સારું/.test(t))return {energy:'good'};return {};}
  if(index===6)return {skills:text};
  if(index===7)return {location:text};
  if(index===8){if(/yes|हाँ|ହଁ|হ্যাঁ|ஆம்|అవును|हो|હા/.test(t))return {contract:'approval'};if(/no|नहीं|ନା|না|இல்லை|కాదు|नाही|ના/.test(t))return {contract:'allowed'};return {contract:'unknown'};}
  return {};
 };
 const handleConfirmation=(answer:string)=>{
  const t=answer.toLowerCase();const yes=lang.yes.some(x=>t.includes(x.toLowerCase()));const no=lang.no.some(x=>t.includes(x.toLowerCase()));
  if(yes){const patch=parse(step,pending);const next={...valuesRef.current,...patch};setValues(next);valuesRef.current=next;setPending('');setMessage('Answer confirmed.');if(step>=8){onComplete(next,lang.locale);setStep(10);say(prompt(10));}else{const n=step+1;setStep(n);say(prompt(n));}}
  else if(no){setPending('');setMessage('Let us try that question again.');say(prompt(step));}
  else{setMessage('I could not identify yes or no. Please try again.');say(prompt(9,pending));}
 };
 const begin=()=>{setValues(initial);valuesRef.current=initial;setStep(0);setTranscript('');setPending('');setMessage('Welcome.');say(prompt(0));};
 const skip=()=>{setPending('');if(step>=8){onComplete(valuesRef.current,lang.locale);setStep(10);say(prompt(10));return;}const n=step+1;setStep(n);say(prompt(n));};
 const stop=()=>{recognition.current?.stop?.();setListening(false);stopSpeech();setMessage('Paused. Resume when you are ready.');};
 return <section className="voice-onboarding" id="voice-start">
  <div className="voice-intro"><span>VOICE-FIRST ONBOARDING</span><h2>Start with your <i>own voice.</i></h2><p>Choose a language and answer one spoken question at a time. You do not need to type. Your answers are confirmed before they are added to your profile.</p></div>
  <div className="voice-console">
   <div className="voice-top"><div><b>NayaPath Voice Assistant</b><small>On-device browser speech · no audio upload by this interface</small></div><label>LANGUAGE<select value={lang.name} onChange={e=>{const selected=supported.find(x=>x.name===e.target.value)!;setLang(selected);stop();setStep(-1);setMessage('Language changed. Press Start to begin again.');}}>{supported.map(x=><option key={x.name} value={x.name}>{x.name}</option>)}</select></label></div>
   <div className={'voice-orb '+(listening?'is-listening':speaking?'is-speaking':'')}><AudioLines size={38}/><b>{listening?'Listening…':speaking?'Speaking…':step===10?'Conversation complete':step<0?'Ready when you are':'Your turn to speak'}</b><small>{lang.name} · {lang.locale}</small></div>
   <div className="voice-prompt"><small>{step>=1&&step<=8?labels[step]:'ASSISTANT'}</small><p>{step>=0&&step<=10?prompt(step, pending):message}</p>{transcript&&<div className="voice-transcript"><b>Recognised speech</b><p>{transcript}</p></div>}</div>
   {error&&<p className="voice-error" role="alert">{error}</p>}
   <div className="voice-actions">
    {step<0||step===10?<button className="voice-primary" onClick={begin}><Play size={17}/> {step===10?'Start again':'Start voice conversation'}</button>:<>
      <button className="voice-primary" onClick={()=>startListening(step===9)} disabled={listening||speaking}><Mic size={17}/> {step===9?'Confirm answer':'Speak answer'}</button>
      <button onClick={skip}>Skip <ChevronRight size={16}/></button>
      <button onClick={stop}><Pause size={16}/> Pause</button>
    </>}
    {step>=0&&step<10&&<button onClick={()=>say(prompt(step, pending))}><Volume2 size={16}/> Repeat question</button>}
   </div>
   <div className="voice-foot"><span>{step>=1&&step<=8?'Question '+step+' of 8':'Your answers are only added after confirmation.'}</span><span>Microphone permission required</span></div>
  </div>
 </section>;
}
