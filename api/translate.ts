import type { VercelRequest, VercelResponse } from '@vercel/node';

const ENDPOINT='https://dhruva-api.bhashini.gov.in/services/inference/pipeline';
export default async function handler(req:VercelRequest,res:VercelResponse){
 if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'});
 const key=process.env.BHASHINI_INFERENCE_API_KEY;
 const serviceId=process.env.BHASHINI_NMT_SERVICE_ID;
 if(!key||!serviceId)return res.status(503).json({error:'Multilingual translation is not configured. Add BHASHINI_INFERENCE_API_KEY and BHASHINI_NMT_SERVICE_ID on the server.'});
 const {text,sourceLanguage,targetLanguage}=req.body||{};
 if(typeof text!=='string'||!text.trim()||text.length>5000||typeof sourceLanguage!=='string'||typeof targetLanguage!=='string')return res.status(400).json({error:'Provide text (max 5,000 characters), sourceLanguage and targetLanguage.'});
 try{
  const upstream=await fetch(ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json',Authorization:key},body:JSON.stringify({pipelineTasks:[{taskType:'translation',config:{language:{sourceLanguage,targetLanguage},serviceId}}],inputData:{input:[{source:text}]}})});
  const data:any=await upstream.json();
  if(!upstream.ok)return res.status(502).json({error:'Translation provider rejected the request.',providerStatus:upstream.status});
  const translated=data?.pipelineResponse?.find((x:any)=>x.taskType==='translation')?.output?.[0]?.target;
  if(typeof translated!=='string'||!translated.trim())return res.status(502).json({error:'The translation provider returned no translated text.'});
  return res.status(200).json({translated,sourceLanguage,targetLanguage,provider:'BHASHINI',verified:false,reviewRequired:true});
 }catch{return res.status(502).json({error:'Translation service is temporarily unavailable.'});}
}
