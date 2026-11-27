import {describe,it,expect} from 'vitest';
import {matchVerifiedResources,VERIFIED_RESOURCES} from './verifiedResources';
describe('official livelihood resource directory',()=>{
 it('has only India-wide, authority-attributed, dated resources with cautions',()=>{
  expect(VERIFIED_RESOURCES.length).toBeGreaterThanOrEqual(5);
  for(const r of VERIFIED_RESOURCES){expect(r.url.startsWith('https://')).toBe(true);expect(r.authority.length).toBeGreaterThan(5);expect(r.evidence.length).toBeGreaterThan(10);expect(r.verifiedOn).toBe('2026-11-27');expect(r.cautions.length).toBeGreaterThan(0);}
 });
 it('prioritises agriculture resources for farmer profiles',()=>{
  const out=matchVerifiedResources({occupation:'small farmer',skills:'crop growing',goal:'better',location:'Nagpur'});
  expect(out[0].id).toBe('kisan-sarathi');
  expect(out.some(x=>x.id==='enam')).toBe(true);
 });
 it('prioritises Udyam information for business exploration',()=>{
  const out=matchVerifiedResources({occupation:'tailor',skills:'stitching',goal:'business',location:'Delhi'});
  expect(out.some(x=>x.id==='udyam')).toBe(true);
 });
 it('does not fabricate city-specific listings from a location string',()=>{
  const a=matchVerifiedResources({occupation:'student',skills:'',goal:'skills',location:'Delhi'});
  const b=matchVerifiedResources({occupation:'student',skills:'',goal:'skills',location:'Kochi'});
  expect(a.map(x=>x.id)).toEqual(b.map(x=>x.id));
  expect(a.every(x=>x.geography==='India-wide')).toBe(true);
 });
});
