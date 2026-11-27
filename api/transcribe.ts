type VercelRequest={method?:string;body:any};
type VercelResponse={status:(code:number)=>VercelResponse;json:(body:unknown)=>void};

const ENDPOINT='https://dhruva-api.bhashini.gov.in/services/inference/pipeline';
export default async function handler(req:VercelRequest,res:VercelResponse){
 if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'});
 const key=process.env.BHASHINI_INFERENCE_API_KEY;
 const serviceId=process.env.BHASHINI_ASR_SERVICE_ID;
 if(!key||!serviceId)return res.status(503).json({error:'Indic speech recognition is not configured. Add BHASHINI_INFERENCE_API_KEY and BHASHINI_ASR_SERVICE_ID on the server.'});
 const {audioContent,language}=req.body||{};
 if(typeof audioContent!=='string'||audioContent.length>12_000_000||(typeof language!=='string'||!language.trim()))return res.status(400).json({error:'Provide base64 audioContent (max request size applies) and language.'});
 try{
  const upstream=await fetch(ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json',Authorization:key},body:JSON.stringify({pipelineTasks:[{taskType:'asr',config:{language:{sourceLanguage:language==='auto'?'auto':language},serviceId}}],inputData:{audio:[{audioContent}]}})});
  const data:any=await upstream.json();
  if(!upstream.ok)return res.status(502).json({error:'Speech recognition provider rejected the request.',providerStatus:upstream.status});
  const result=data?.pipelineResponse?.find((x:any)=>x.taskType==='asr')?.output?.[0];
  const transcript=result?.source||result?.target;
  if(typeof transcript!=='string'||!transcript.trim())return res.status(502).json({error:'The speech service returned no transcript.'});
  const detectedLanguage=String(result?.lang||result?.language||language);return res.status(200).json({transcript,language:detectedLanguage,provider:'BHASHINI',confidence:null,reviewRequired:true,automaticDetectionRequested:language==='auto'});
 }catch{return res.status(502).json({error:'Speech recognition is temporarily unavailable.'});}
}
