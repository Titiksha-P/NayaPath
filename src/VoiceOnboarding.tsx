import { useCallback, useEffect, useRef, useState } from 'react';
import { AudioLines, Mic, Volume2 } from 'lucide-react';
import { INDIC_LANGUAGES, translateText } from './languageService';

type Language={name:string;locale:string;code:string};
const languages=INDIC_LANGUAGES;
type Values={occupation:string;goal:string;hours:string;daysOff:string;energy:string;skills:string;location:string;contract:string};
const empty:Values={occupation:'',goal:'extra',hours:'',daysOff:'',energy:'',skills:'',location:'',contract:'unknown'};
const welcome:Record<string,string>={
 'en-IN':'Welcome to NayaPath. Tell me, in your own words, what is happening in your work or life and what kind of help you need. I am listening.',
 'hi-IN':'नमस्ते! नया पथ में आपका स्वागत है। आप अपने काम या जीवन में क्या परेशानी महसूस कर रहे हैं और आपको किस तरह की मदद चाहिए, अपने शब्दों में बताइए। मैं सुन रहा हूँ।',
 'or-IN':'ନମସ୍କାର! NayaPath କୁ ସ୍ୱାଗତ। ଆପଣଙ୍କ କାମ କିମ୍ବା ଜୀବନରେ କେଉଁ ସମସ୍ୟା ଅଛି ଏବଂ କେଉଁ ସାହାଯ୍ୟ ଦରକାର, ନିଜ ଭାଷାରେ କୁହନ୍ତୁ। ମୁଁ ଶୁଣୁଛି।',
 'bn-IN':'নমস্কার! NayaPath-এ স্বাগতম। আপনার কাজ বা জীবনে কী সমস্যা হচ্ছে এবং কী ধরনের সাহায্য চান, নিজের ভাষায় বলুন। আমি শুনছি।',
 'ta-IN':'வணக்கம்! NayaPath-க்கு வரவேற்கிறோம். உங்கள் வேலை அல்லது வாழ்க்கையில் என்ன பிரச்சினை உள்ளது, என்ன உதவி வேண்டும் என்பதை உங்கள் சொந்த வார்த்தைகளில் சொல்லுங்கள். நான் கேட்கிறேன்.',
 'te-IN':'నమస్కారం! NayaPath కు స్వాగతం. మీ పని లేదా జీవితంలో ఏ సమస్య ఉంది, మీకు ఎలాంటి సహాయం కావాలో మీ మాటల్లో చెప్పండి. నేను వింటున్నాను.',
 'mr-IN':'नमस्कार! NayaPath मध्ये आपले स्वागत आहे. तुमच्या कामात किंवा आयुष्यात कोणती अडचण आहे आणि तुम्हाला कोणती मदत हवी आहे ते तुमच्या शब्दांत सांगा. मी ऐकत आहे.',
 'gu-IN':'નમસ્તે! NayaPath માં આપનું સ્વાગત છે. તમારા કામમાં અથવા જીવનમાં શું મુશ્કેલી છે અને તમને કેવી મદદ જોઈએ છે તે તમારા શબ્દોમાં કહો. હું સાંભળી રહ્યો છું.'
};
const literacy:Record<string,string>={
 'en-IN':'Thank you for sharing that. One important question: can you read and write in this language, or do you mainly speak it? You can say: I can read and write, or I can only speak.',
 'hi-IN':'अपनी बात बताने के लिए धन्यवाद। एक ज़रूरी सवाल: क्या आप इस भाषा को पढ़ और लिख सकते हैं, या केवल बोल सकते हैं? आप कह सकते हैं: मैं पढ़-लिख सकता हूँ, या मैं केवल बोल सकता हूँ।',
 'or-IN':'ଆପଣଙ୍କ କଥା କହିଥିବାରୁ ଧନ୍ୟବାଦ। ଗୋଟିଏ ଜରୁରୀ ପ୍ରଶ୍ନ: ଆପଣ ଏହି ଭାଷା ପଢ଼ି ଓ ଲେଖି ପାରନ୍ତି, ନା କେବଳ କହି ପାରନ୍ତି?',
 'bn-IN':'আপনার কথা জানানোর জন্য ধন্যবাদ। একটি জরুরি প্রশ্ন: আপনি কি এই ভাষা পড়তে ও লিখতে পারেন, নাকি শুধু বলতে পারেন?',
 'ta-IN':'உங்கள் நிலையைப் பகிர்ந்ததற்கு நன்றி. ஒரு முக்கியமான கேள்வி: இந்த மொழியை உங்களால் படிக்கவும் எழுதவும் முடியுமா, அல்லது பேச மட்டும்தானா தெரியும்?',
 'te-IN':'మీ విషయం చెప్పినందుకు ధన్యవాదాలు. ఒక ముఖ్యమైన ప్రశ్న: మీకు ఈ భాష చదవడం, రాయడం వచ్చా? లేక మాట్లాడటం మాత్రమే వచ్చా?',
 'mr-IN':'तुमची अडचण सांगितल्याबद्दल धन्यवाद. एक महत्त्वाचा प्रश्न: तुम्हाला ही भाषा वाचता आणि लिहिता येते का, की फक्त बोलता येते?',
 'gu-IN':'તમારી વાત જણાવવા બદલ આભાર. એક મહત્વનો પ્રશ્ન: શું તમે આ ભાષા વાંચી અને લખી શકો છો, કે ફક્ત બોલી શકો છો?'
};
const questions:Record<string,string[]> = {
 'en-IN':['What kind of work do you do now?','What would help most: better income in your current work, extra income, your own business, or learning for a different opportunity?','How many hours do you usually work each day?','How many days off do you usually get each week?','After work, do you feel energetic, a little tired, or exhausted?','What skills or tasks have you learned through work or daily life?','Which city or district do you live or work in?','Does your employer or agreement restrict other work, or require permission?'],
 'hi-IN':['आप अभी कौन सा काम करते हैं?','आपको सबसे ज़्यादा किस चीज़ में मदद चाहिए: अभी के काम में ज़्यादा कमाई, अतिरिक्त कमाई, अपना व्यवसाय, या नए काम के लिए सीखना?','आप रोज़ आमतौर पर कितने घंटे काम करते हैं?','हफ्ते में कितने दिन छुट्टी मिलती है?','काम के बाद आप कैसा महसूस करते हैं: ठीक, थोड़ा थका हुआ, या बहुत थका हुआ?','काम या रोज़मर्रा की ज़िंदगी से आपने कौन-कौन से हुनर सीखे हैं?','आप किस शहर या ज़िले में रहते या काम करते हैं?','क्या आपके मालिक या काम के नियम दूसरे काम पर रोक लगाते हैं या अनुमति ज़रूरी है?'],
 'or-IN':['ଆପଣ ବର୍ତ୍ତମାନ କେଉଁ କାମ କରୁଛନ୍ତି?','ଆପଣଙ୍କୁ କେଉଁ ସାହାଯ୍ୟ ଅଧିକ ଦରକାର: ବର୍ତ୍ତମାନ କାମରେ ଅଧିକ ଆୟ, ଅତିରିକ୍ତ ଆୟ, ନିଜ ବ୍ୟବସାୟ, ନା ନୂଆ କାମ ପାଇଁ ଶିଖିବା?','ଆପଣ ପ୍ରତିଦିନ କେତେ ଘଣ୍ଟା କାମ କରନ୍ତି?','ସପ୍ତାହରେ କେତେ ଦିନ ଛୁଟି ମିଳେ?','କାମ ପରେ ଆପଣଙ୍କୁ କେମିତି ଲାଗେ: ଭଲ, ଟିକେ ଥକା, ନା ବହୁତ ଥକା?','କାମ କିମ୍ବା ଦୈନନ୍ଦିନ ଜୀବନରୁ କେଉଁ କୌଶଳ ଶିଖିଛନ୍ତି?','ଆପଣ କେଉଁ ସହର କିମ୍ବା ଜିଲ୍ଲାରେ ରୁହନ୍ତି କିମ୍ବା କାମ କରନ୍ତି?','ଅନ୍ୟ କାମ କରିବାକୁ ମାଲିକଙ୍କ ଅନୁମତି ଦରକାର କିମ୍ବା କୌଣସି ନିୟମରେ ମନା ଅଛି କି?'],
 'bn-IN':['আপনি এখন কী কাজ করেন?','আপনার সবচেয়ে বেশি কী সাহায্য দরকার: বর্তমান কাজে বেশি আয়, অতিরিক্ত আয়, নিজের ব্যবসা, নাকি নতুন কাজ শেখা?','আপনি প্রতিদিন সাধারণত কত ঘণ্টা কাজ করেন?','সপ্তাহে কত দিন ছুটি পান?','কাজের পরে কেমন লাগে: ভালো, একটু ক্লান্ত, নাকি খুব ক্লান্ত?','কাজ বা দৈনন্দিন জীবন থেকে কী কী দক্ষতা শিখেছেন?','আপনি কোন শহর বা জেলায় থাকেন বা কাজ করেন?','অন্য কাজ করতে মালিকের অনুমতি লাগে বা কোনো নিয়মে বাধা আছে কি?'],
 'ta-IN':['நீங்கள் இப்போது என்ன வேலை செய்கிறீர்கள்?','உங்களுக்கு எது முக்கியம்: தற்போதைய வேலையில் அதிக வருமானம், கூடுதல் வருமானம், சொந்தத் தொழில், அல்லது புதிய வேலைக்கான பயிற்சியா?','ஒரு நாளில் எத்தனை மணி நேரம் வேலை செய்கிறீர்கள்?','வாரத்தில் எத்தனை நாட்கள் விடுமுறை கிடைக்கும்?','வேலைக்குப் பிறகு எப்படி உணர்கிறீர்கள்: நன்றாகவா, கொஞ்சம் சோர்வாகவா, மிகவும் சோர்வாகவா?','வேலை அல்லது அன்றாட வாழ்க்கையில் என்ன திறன்களைக் கற்றுள்ளீர்கள்?','எந்த நகரம் அல்லது மாவட்டத்தில் வசிக்கிறீர்கள் அல்லது வேலை செய்கிறீர்கள்?','வேறு வேலை செய்ய முதலாளியின் அனுமதி தேவையா அல்லது விதிமுறை தடையா?'],
 'te-IN':['మీరు ప్రస్తుతం ఏ పని చేస్తున్నారు?','మీకు ఏది ముఖ్యం: ప్రస్తుత పనిలో ఎక్కువ ఆదాయం, అదనపు ఆదాయం, స్వంత వ్యాపారం, లేదా కొత్త పని నేర్చుకోవడమా?','మీరు రోజుకు ఎన్ని గంటలు పని చేస్తారు?','వారానికి ఎన్ని రోజులు సెలవు ఉంటుంది?','పని తర్వాత ఎలా అనిపిస్తుంది: బాగుంటుందా, కొంచెం అలసటగా ఉంటుందా, చాలా అలసటగా ఉంటుందా?','పని లేదా రోజువారీ జీవితం ద్వారా ఏ నైపుణ్యాలు నేర్చుకున్నారు?','మీరు ఏ నగరం లేదా జిల్లాలో ఉంటారు లేదా పని చేస్తారు?','ఇతర పని చేయడానికి యజమాని అనుమతి అవసరమా లేదా ఏదైనా నియమం అడ్డుకుంటుందా?'],
 'mr-IN':['तुम्ही सध्या कोणते काम करता?','तुम्हाला कशाची जास्त गरज आहे: सध्याच्या कामात अधिक उत्पन्न, अतिरिक्त उत्पन्न, स्वतःचा व्यवसाय, की नवीन काम शिकणे?','तुम्ही दररोज किती तास काम करता?','आठवड्यात किती दिवस सुट्टी मिळते?','कामानंतर कसे वाटते: ठीक, थोडा थकवा, की खूप थकवा?','कामातून किंवा रोजच्या जीवनातून कोणती कौशल्ये शिकला आहात?','कोणत्या शहरात किंवा जिल्ह्यात राहता किंवा काम करता?','दुसरे काम करण्यासाठी मालकाची परवानगी लागते किंवा काही नियम अडथळा आणतात का?'],
 'gu-IN':['તમે હાલમાં કયું કામ કરો છો?','તમને સૌથી વધુ શેની જરૂર છે: હાલના કામમાં વધુ આવક, વધારાની આવક, પોતાનો વ્યવસાય, કે નવું કામ શીખવું?','તમે દરરોજ કેટલા કલાક કામ કરો છો?','અઠવાડિયામાં કેટલા દિવસ રજા મળે છે?','કામ પછી કેવું લાગે છે: સારું, થોડો થાક, કે ખૂબ થાક?','કામ અથવા રોજિંદા જીવનમાંથી કઈ કુશળતા શીખ્યા છો?','કયા શહેર અથવા જિલ્લામાં રહો છો અથવા કામ કરો છો?','બીજું કામ કરવા માલિકની મંજૂરી જરૂરી છે કે કોઈ નિયમ રોકે છે?']
};
type Props={onComplete:(values:Values,locale:string)=>void};
export default function VoiceOnboarding({onComplete}:Props){
 const [lang,setLang]=useState<Language>(()=>languages.find(x=>x.locale==='en-IN')!);
 const [hasChosenLanguage,setHasChosenLanguage]=useState(false);
 const [phase,setPhase]=useState<'intro'|'story'|'literacy'|'questions'|'done'>('intro');
 const [index,setIndex]=useState(0);
 const [listening,setListening]=useState(false);
 const [speaking,setSpeaking]=useState(false);
 const [needsTap,setNeedsTap]=useState(false);
 const [error,setError]=useState('');
 const [translationStatus,setTranslationStatus]=useState('');
 const [lastTranscript,setLastTranscript]=useState('');
 const [englishTranscript,setEnglishTranscript]=useState('');
 const [translationBusy,setTranslationBusy]=useState(false);
 const [voiceOnly,setVoiceOnly]=useState(true);
 const [values,setValues]=useState<Values>(empty);
 const [story,setStory]=useState('');
 const recognition=useRef<any>(null);
 const audioRef=useRef<HTMLAudioElement|null>(null);
 const active=useRef(true);
 const busy=useRef(false);
 const phaseRef=useRef(phase);
 const indexRef=useRef(index);
 const langRef=useRef(lang);
 const valuesRef=useRef(values);
 const storyRef=useRef(story);
 useEffect(()=>{phaseRef.current=phase;},[phase]);
 useEffect(()=>{indexRef.current=index;},[index]);
 useEffect(()=>{langRef.current=lang;},[lang]);
 useEffect(()=>{valuesRef.current=values;},[values]);
 useEffect(()=>{storyRef.current=story;},[story]);
 const speechText=(p:typeof phase,i=index)=>p==='intro'?(welcome[lang.locale]||welcome['en-IN']):p==='literacy'?(literacy[lang.locale]||literacy['en-IN']):p==='questions'?((questions[lang.locale]||questions['en-IN'])[i]):p==='done'?(lang.locale==='hi-IN'?'धन्यवाद। अब आपकी जानकारी के आधार पर अवसर देखे जा सकते हैं।':'Thank you. We can now explore opportunities based on what you shared.'):'';
 const speak=useCallback(async(text:string,thenListen=true)=>{
  window.speechSynthesis?.cancel();audioRef.current?.pause();
  setSpeaking(true);
  try{
   const code=languages.find(x=>x.locale===langRef.current.locale)?.code||'en';
   const response=await fetch('/api/synthesize',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text,language:code})});
   if(response.ok){const data=await response.json();const audio=new Audio('data:audio/wav;base64,'+data.audioContent);audioRef.current=audio;audio.onended=()=>{setSpeaking(false);if(thenListen&&active.current)startRef.current?.();};audio.onerror=()=>{setSpeaking(false);setError('Generated speech could not be played.');};await audio.play();return;}
  }catch{/* Use the device voice as a fallback. */}
  if(!('speechSynthesis' in window)){setSpeaking(false);setError('Speech playback is not available on this device.');setNeedsTap(true);return;}
  const synth=window.speechSynthesis;
  const playWithAvailableVoice=()=>{
   const u=new SpeechSynthesisUtterance(text);
   const requested=langRef.current.locale;
   const voices=synth.getVoices();
   const base=requested.split('-')[0].toLowerCase();
   const selected=voices.find(v=>v.lang.toLowerCase()===requested.toLowerCase())||voices.find(v=>v.lang.toLowerCase().startsWith(base+'-'))||(base==='en'?voices.find(v=>v.lang.toLowerCase().startsWith('en-')):undefined);
   if(selected)u.voice=selected;
   u.lang=selected?.lang||(base==='en'?'en-US':requested);u.rate=.9;
   u.onstart=()=>{setSpeaking(true);setError('');};
   u.onend=()=>{setSpeaking(false);if(thenListen&&active.current)startRef.current?.();};
   u.onerror=(event:any)=>{setSpeaking(false);setError(event.error==='not-allowed'?'Allow audio playback in your browser, then tap Repeat aloud.':'Your browser could not play this language\'s voice. Try installing a system voice or using the voice service.');if(thenListen)setNeedsTap(true);};
   synth.speak(u);
  };
  if(synth.getVoices().length){playWithAvailableVoice();}
  else{
   let done=false;const onVoices=()=>{if(done)return;done=true;synth.removeEventListener?.('voiceschanged',onVoices);playWithAvailableVoice();};
   synth.addEventListener?.('voiceschanged',onVoices);
   window.setTimeout(()=>{if(!done){done=true;synth.removeEventListener?.('voiceschanged',onVoices);playWithAvailableVoice();}},1200);
  }
 },[]);
 const applyAnswer=(text:string)=>{
  const p=phaseRef.current;const loc=langRef.current.locale;const t=text.toLowerCase();
  if(/^(skip|pass|छोड़ो|छोड़ दें|ଛାଡ଼ନ୍ତୁ|বাদ দিন|தவிர்க்கவும்|దాటవేయి|वगळा|છોડી દો)$/.test(t.trim())&&p==='questions'){if(indexRef.current>=7){setPhase('done');onComplete(valuesRef.current,loc);speak(loc==='hi-IN'?'धन्यवाद। अब हम आपके लिए सही अवसर खोजने की दिशा में आगे बढ़ सकते हैं।':'Thank you. We can now explore suitable opportunities.',false);}else{const n=indexRef.current+1;setIndex(n);speak((questions[loc]||questions['en-IN'])[n]);}return;}
  if(/^(repeat|again|फिर से|दोबारा|ପୁଣିଥରେ|আবার|மீண்டும்|మళ్లీ|पुन्हा|ફરીથી)$/.test(t.trim())){speak(speechText(p,indexRef.current));return;}
  if(p==='intro'){setStory(text);storyRef.current=text;const inferred:Partial<Values>={occupation:text,skills:text};if(/business|व्यवसाय|दुकान|व्यापार|ବ୍ୟବସାୟ|ব্যবসা|தொழில்|వ్యాపారం|ધંધો|व्यवसाय/.test(t))inferred.goal='business';else if(/job|काम|नौकरी|आय|कमाई|ଟଙ୍କା|ରୋଜଗାର|টাকা|வருமானம்|ఆదాయం|उत्पन्न|આવક/.test(t))inferred.goal='better';setValues(v=>({...v,...inferred}));valuesRef.current={...valuesRef.current,...inferred};setPhase('literacy');speak(literacy[loc]||literacy['en-IN']);return;}
  if(p==='literacy'){
   const canRead=/read|write|पढ़|लिख|ପଢ଼|ଲେଖ|পড়|লিখ|படி|எழுது|చదవ|రాయ|वाच|लिह|વાંચ|લખ/.test(t);
   const speakOnly=/only speak|speak only|सिर्फ बोल|केवल बोल|କେବଳ କହ|শুধু বল|பேச மட்டுமே|మాట్లాడటం మాత్రమే|फक्त बोल|ફક્ત બોલ/.test(t);
   setVoiceOnly(true);setPhase('questions');setIndex(0);speak((questions[loc]||questions['en-IN'])[0]);return;
  }
  if(p==='questions'){
   const patch:Partial<Values>={};
   if(indexRef.current===0)patch.occupation=text;
   if(indexRef.current===1){if(/business|व्यवसाय|व्यापार|ବ୍ୟବସାୟ|ব্যবসা|தொழில்|వ్యాపారం|ધંધો/.test(t))patch.goal='business';else if(/skill|learn|कौशल|सीख|ଦକ୍ଷତା|শিখ|திறன்|నేర్చ|कौशल्य|શીખ/.test(t))patch.goal='skills';else if(/better|अधिक|ज्यादा|बेहतर|ଅଧିକ|বেশি|மேலும்|మెరుగైన|वधार|વધુ/.test(t))patch.goal='better';else patch.goal='extra';}
   if(indexRef.current===2){const n=text.match(/\d+(?:\.\d+)?/);if(n)patch.hours=String(Math.min(18,Math.max(0,Number(n[0]))));}
   if(indexRef.current===3){const n=text.match(/\d+/);if(n)patch.daysOff=String(Math.min(7,Math.max(0,Number(n[0]))));}
   if(indexRef.current===4){if(/exhaust|बहुत थक|বহুৎ ক্লান্ত|খুব ক্লান্ত|மிகவும் சோர்வு|చాలా అలస|ખૂબ થાક/.test(t))patch.energy='exhausted';else if(/tired|थक|ক্লান্ত|சோர்வு|అలసట|થાક/.test(t))patch.energy='low';else patch.energy='good';}
   if(indexRef.current===5)patch.skills=text;
   if(indexRef.current===6)patch.location=text;
   if(indexRef.current===7){if(/yes|हाँ|हां|ହଁ|হ্যাঁ|ஆம்|అవును|हो|હા/.test(t))patch.contract='approval';else if(/no|नहीं|ନା|না|இல்லை|కాదు|नाही|ના/.test(t))patch.contract='allowed';else patch.contract='unknown';}
   const next={...valuesRef.current,...patch};setValues(next);valuesRef.current=next;
   if(indexRef.current>=7){setPhase('done');onComplete(next,loc);speak(loc==='hi-IN'?'धन्यवाद। अब हम आपके लिए सही अवसर खोजने की दिशा में आगे बढ़ सकते हैं।':'Thank you. We can now explore suitable opportunities.',false);return;}
   const n=indexRef.current+1;setIndex(n);speak((questions[loc]||questions['en-IN'])[n]);return;
  }
 };
 const startRef=useRef<(()=>void)|null>(null);
 const startListening=useCallback(()=>{
  if(!active.current||busy.current)return;
  const SR=(window as any).SpeechRecognition||(window as any).webkitSpeechRecognition;
  if(!SR){setError('This browser does not support speech recognition. Try an up-to-date Chrome browser.');setNeedsTap(true);return;}
  try{
   const rec=new SR();recognition.current=rec;rec.lang=langRef.current.locale;rec.continuous=false;rec.interimResults=true;rec.maxAlternatives=3;
   rec.onstart=()=>{busy.current=true;setListening(true);setError('');setNeedsTap(false);};
   rec.onresult=async(e:any)=>{let finalText='';let interim='';for(let i=e.resultIndex;i<e.results.length;i++){const part=String(e.results[i]?.[0]?.transcript||'').trim();if(e.results[i].isFinal)finalText+=part+' ';else interim+=part+' ';}if(interim)setLastTranscript(interim.trim());if(!finalText.trim())return;const spoken=finalText.trim();setLastTranscript(spoken);setTranslationStatus('');const code=languages.find(x=>x.locale===langRef.current.locale)?.code||'en';if(code==='en'){setEnglishTranscript(spoken);applyAnswer(spoken);return;}setTranslationBusy(true);setTranslationStatus('Translating your words…');try{const result=await translateText(spoken,code,'en');setEnglishTranscript(result.translated);setTranslationStatus('English translation — check meaning if anything seems incorrect.');applyAnswer(result.translated);}catch{setEnglishTranscript('Translation is unavailable. Your original words are preserved.');setTranslationStatus('Could not translate this response. Please try again or continue only after confirming its meaning.');}finally{setTranslationBusy(false);}};
   rec.onerror=(e:any)=>{setError(e.error==='not-allowed'?'Allow microphone access once to start the conversation.':e.error==='language-not-supported'?'Speech recognition for this language is not supported by this browser. Choose another available speech language.':'I could not hear that clearly. I will listen again.');if(e.error==='not-allowed'||e.error==='service-not-allowed'){setNeedsTap(true);active.current=false;}};
   rec.onend=()=>{busy.current=false;setListening(false);if(active.current&&phaseRef.current!=='done'&&!window.speechSynthesis?.speaking&&!needsTap)setTimeout(()=>startRef.current?.(),450);};
   rec.start();
  }catch{busy.current=false;setListening(false);setNeedsTap(true);setError('Tap once to allow the microphone, then the conversation can continue automatically.');}
 },[]);
 startRef.current=startListening;
 const begin=useCallback(()=>{setNeedsTap(false);setError('');active.current=true;if(phaseRef.current==='intro')speak(welcome[langRef.current.locale]||welcome['en-IN']);else startListening();},[speak,startListening]);
 useEffect(()=>{
  let cancelled=false;let recorder:MediaRecorder|undefined;let stream:MediaStream|undefined;let timeout:number|undefined;
  const captureFirstStory=async()=>{
   try{
    if(!navigator.mediaDevices?.getUserMedia||typeof MediaRecorder==='undefined')throw new Error('Automatic audio capture is not supported in this browser.');
    stream=await navigator.mediaDevices.getUserMedia({audio:true});
    if(cancelled){stream.getTracks().forEach(t=>t.stop());return;}
    const chunks:BlobPart[]=[];recorder=new MediaRecorder(stream);recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};
    recorder.onstop=async()=>{
     stream?.getTracks().forEach(t=>t.stop());if(cancelled)return;
     try{
      const blob=new Blob(chunks,{type:recorder?.mimeType||'audio/webm'});if(!blob.size)throw new Error('No speech audio was captured.');
      const base64=await new Promise<string>((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result).split(',')[1]||'');reader.onerror=()=>reject(new Error('Could not read microphone audio.'));reader.readAsDataURL(blob);});
      const response=await fetch('/api/transcribe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({audioContent:base64,mimeType:blob.type||'audio/webm',language:'auto',includeTranslation:true})});
      const data=await response.json();if(!response.ok)throw new Error(data.error||'Automatic language recognition is unavailable.');
      const raw=String(data.language||'').toLowerCase();const normalizedRaw=raw==='od-in'?'or-in':raw;const detected=languages.find(x=>x.code===normalizedRaw||x.locale.toLowerCase()===normalizedRaw||x.locale.toLowerCase().startsWith(normalizedRaw+'-'));
      if(!detected)throw new Error('I heard your voice, but could not confidently identify its language. Please choose it from the language list.');
      if(cancelled)return;
      setLang(detected);langRef.current=detected;setHasChosenLanguage(true);setLastTranscript(data.transcript);setEnglishTranscript('');setNeedsTap(false);setError('');
      let understood=data.transcript;
      if(typeof data.englishTranslation==='string'&&data.englishTranslation.trim()){understood=data.englishTranslation;setEnglishTranscript(data.englishTranslation);setTranslationStatus('English translation from Sarvam Saaras v4. Please confirm important details.');}
      else if(detected.code==='en'){setEnglishTranscript(data.transcript);setTranslationStatus('English speech recognized.');}
      else{setEnglishTranscript('English translation is unavailable. Your original words are preserved.');setTranslationStatus('Translation could not be completed. Please confirm the meaning before continuing.');}
      if(cancelled)return;
      applyAnswer(understood);
     }catch(err){if(!cancelled){setError(err instanceof Error?err.message:'Could not understand the first recording. Choose your language and try again.');setNeedsTap(true);}}
    };
    recorder.start();setListening(true);setNeedsTap(false);
    timeout=window.setTimeout(()=>{if(recorder?.state==='recording')recorder.stop();},20000);
   }catch(err){if(!cancelled){setListening(false);setNeedsTap(true);setError(err instanceof Error?err.message:'Please allow microphone access to tell your story.');}}
  };
  void captureFirstStory();
  return()=>{cancelled=true;if(timeout)window.clearTimeout(timeout);if(recorder?.state==='recording')recorder.stop();stream?.getTracks().forEach(t=>t.stop());active.current=false;recognition.current?.stop?.();window.speechSynthesis?.cancel?.();audioRef.current?.pause();};
 },[]);
 const changeLanguage=(locale:string)=>{const selected=languages.find(x=>x.locale===locale);if(!selected)return;recognition.current?.stop?.();window.speechSynthesis?.cancel?.();setLang(selected);langRef.current=selected;setHasChosenLanguage(true);setError('');setNeedsTap(false);active.current=true;if(phaseRef.current==='intro'){speak(welcome[locale]||welcome['en-IN']);}else{setError('Language changed. Please continue speaking in the selected language.');speak(speechText(phaseRef.current,indexRef.current));}};
 const stop=()=>{active.current=false;recognition.current?.stop?.();window.speechSynthesis?.cancel?.();setListening(false);setSpeaking(false);setNeedsTap(true);setError('Conversation paused. Tap Continue when you are ready.');};
 const currentStatus=!hasChosenLanguage?(listening?'Listening to your story':'Waiting for your voice'):listening?'Listening — speak naturally':speaking?'Speaking to you':needsTap?'Microphone needs one tap':phase==='done'?'Conversation complete':'Ready';
 return <section className={'voice-onboarding voice-first '+(voiceOnly?'voice-only':'')} id="voice-start" aria-label="NayaPath voice assistant">
  <div className="voice-intro"><span>YOUR VOICE COMES FIRST</span><h2>Tell me what is <i>happening.</i></h2><p>You do not need to fill out a form. Just tell NayaPath what you need. The assistant will guide you by voice.</p></div>
  <div className="voice-console">
   <div className="voice-top"><div><b>NayaPath Voice Assistant</b><small>Speak naturally. The assistant listens after each spoken prompt.</small></div><label>YOUR LANGUAGE<select aria-label="Speech language" value={hasChosenLanguage?lang.locale:""} onChange={e=>changeLanguage(e.target.value)}><option value="" disabled>Choose your language</option>{languages.map(x=><option key={x.locale} value={x.locale}>{x.name}</option>)}</select></label></div>
   <div className={'voice-orb '+(listening?'is-listening':speaking?'is-speaking':'')}><AudioLines size={40}/><b>{currentStatus}</b><small>{hasChosenLanguage?lang.name+' · '+lang.locale:'Speak naturally; I will identify your language'}</small></div>
   {phase==='intro'&&null}
   {phase==='literacy'&&<div className="voice-prompt voice-prompt-primary"><small>ONE QUICK QUESTION</small><p>{literacy[lang.locale]||literacy['en-IN']}</p></div>}
   {phase==='questions'&&<div className="voice-prompt voice-prompt-primary"><small>QUESTION {index+1} OF 8</small><p>{(questions[lang.locale]||questions['en-IN'])[index]}</p></div>}
   {phase==='done'&&<div className="voice-prompt voice-prompt-primary"><small>THANK YOU</small><p>Your answers have been added to your NayaPath profile. The assistant has finished this first conversation.</p></div>}
   <div className="voice-live-transcripts" aria-live="polite">
    <section className="voice-transcript voice-original"><b>{listening?'You are saying':'What you said'} · {hasChosenLanguage?lang.name:'Detecting spoken language'}</b><p>{lastTranscript||'Your spoken words will appear here as they are recognized.'}</p></section>
    <section className="voice-transcript voice-english"><b>English meaning</b><p>{englishTranscript||(translationBusy?'Translating…':'Your English translation will appear here.')}</p>{translationStatus&&<small>{translationStatus}</small>}</section>
   </div>
   {error&&<p className="voice-error" role="alert">{error}{phase==='intro'?' You can choose a language above to use browser speech recognition instead.':''}</p>}
   <div className="voice-actions">
    {hasChosenLanguage&&(needsTap||phase!=='done'&&phase!=='intro')&&<button className="voice-primary" onClick={begin}><Mic size={17}/> {error.includes('paused')?'Continue':'Enable microphone / Continue'}</button>}
    {phase!=='intro'&&phase!=='done'&&<button onClick={()=>speak(speechText(phase,index),true)}><Volume2 size={17}/> Repeat aloud</button>}
    {phase!=='intro'&&phase!=='done'&&<button onClick={stop}>Pause conversation</button>}
   </div>
   <div className="voice-foot"><span>{phase==='intro'?'Listening for your story':phase==='literacy'?'Speaking and reading preference':phase==='questions'?'Guided conversation · '+(index+1)+'/8':'Your conversation is complete'}</span><span>{voiceOnly?'Voice-first mode':'Voice + reading mode'}</span></div>
  </div>
 </section>;
}
