import type { VercelRequest, VercelResponse } from '@vercel/node';
const ENDPOINT='https://dhruva-api.bhashini.gov.in/services/inference/pipeline';
export default async function handler(req:VercelRequest,res:VercelResponse){
 if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'});
 const key=process.env.BHASHINI_INFERENCE_API_KEY,serviceId=process.env.BHASHINI_TTS_SERVICE_ID;
 if(!key||!serviceId)return res.status(503).json({error:'Indic speech synthesis is not configured. Add BHASHINI_INFERENCE_API_KEY and BHASHINI_TTS_SERVICE_ID on the server.'});
 const {text,language}=req.body||{};
 if(typeof text!=='string'||!text.trim()||text.length>3000||typeof language!=='string')return res.status(400).json({error:'Provide text (max 3,000 characters) and language.'});
 try{
  const upstream=await fetch(ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json',Authorization:key},body:JSON.stringify({pipelineTasks:[{taskType:'tts',config:{language:{sourceLanguage:language},serviceId}}],inputData:{input:[{source:text}]}})});
  const data:any=await upstream.json();if(!upstream.ok)return res.status(502).json({error:'Speech synthesis provider rejected the request.',providerStatus:upstream.status});
  const result=data?.pipelineResponse?.find((x:any)=>x.taskType==='tts')?.audio?.[0]?.audioContent||data?.pipelineResponse?.find((x:any)=>x.taskType==='tts')?.output?.[0]?.audioContent;
  if(typeof result!=='string')return res.status(502).json({error:'The speech service returned no audio.'});
  return res.status(200).json({audioContent:result,provider:'BHASHINI'});
 }catch{return res.status(502).json({error:'Speech synthesis is temporarily unavailable.'});}
}