import { describe, it, expect } from 'vitest';
import { assessProfile, recommendOpportunities, type Profile } from './livelihoodEngine';
const base:Profile={occupation:'teacher',goal:'extra',hoursPerDay:8,commuteMinutes:30,daysOff:1,energy:'good',contract:'allowed',skills:'teaching communication',device:'computer',budget:0,location:'Pune',family:''};
describe('universal livelihood engine',()=>{
 it('generates multiple pathways from a shared catalogue rather than occupation-specific branches',()=>{
  const result=recommendOpportunities(base);
  expect(new Set(result.map(x=>x.pathway)).size).toBeGreaterThanOrEqual(3);
 });
 it('asks targeted questions when important profile data is missing',()=>{
  const q=assessProfile({...base,hoursPerDay:null,energy:'unknown',contract:'unknown',daysOff:null,budget:null,location:''});
  expect(q.length).toBeGreaterThanOrEqual(6);
 });
 it('does not recommend extra shifts when work is long and energy is depleted',()=>{
  const result=recommendOpportunities({...base,hoursPerDay:12,energy:'exhausted'});
  expect(result.find(x=>x.id==='supplementary-flex')?.status).toBe('avoid');
 });
 it('holds contract-sensitive outside work when approval is required',()=>{
  const result=recommendOpportunities({...base,contract:'approval'});
  expect(result.find(x=>x.id==='supplementary-flex')?.status).toBe('avoid');
  expect(result.find(x=>x.id==='primary-review')?.status).toBe('fit');
 });
 it('does not treat unknown working hours as spare time',()=>{
  const result=recommendOpportunities({...base,hoursPerDay:null});
  expect(result.find(x=>x.id==='supplementary-flex')?.status).toBe('check');
 });
 it('respects limited device access',()=>{
  const result=recommendOpportunities({...base,device:'none'});
  expect(result.find(x=>x.id==='digital-service')?.status).toBe('avoid');
 });
 it('keeps low/no-cost paths available for a zero-spend profile',()=>{
  const result=recommendOpportunities({...base,budget:0});
  expect(result.some(x=>x.status!=='avoid' && x.cost.toLowerCase().includes('₹0'))).toBe(true);
 });
 it('handles a broad set of generated profiles without empty or unsafe results',()=>{
  for(let i=0;i<120;i++){
   const p:Profile={...base,occupation:['farmer','driver','homemaker','security guard','student','nurse','shopkeeper','construction worker','artist','delivery rider'][i%10],hoursPerDay:[null,4,8,10,12][i%5],energy:(['unknown','good','low','exhausted'] as const)[i%4],daysOff:[null,0,1,2][i%4],contract:(['unknown','allowed','approval','restricted'] as const)[i%4],device:(['smartphone','limited','computer','none'] as const)[i%4],budget:[null,0,500,2000][i%4],location:i%3?'Jaipur':''};
   const out=recommendOpportunities(p);
   expect(out.length).toBeGreaterThan(0);
   expect(out.some(x=>x.pathway==='primary-income'||x.pathway==='capability-development')).toBe(true);
  }
 });
});
