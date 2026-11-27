import {describe,it,expect} from 'vitest';
import {matchVerifiedResources,VERIFIED_RESOURCES} from './verifiedResources';
describe('official livelihood resource directory',()=>{
 it('has authority-attributed, dated resources with cautions',()=>{
  expect(VERIFIED_RESOURCES.length).toBeGreaterThanOrEqual(7);
  for(const resource of VERIFIED_RESOURCES){expect(resource.url.startsWith('https://')).toBe(true);expect(resource.authority.length).toBeGreaterThan(5);expect(resource.evidence.length).toBeGreaterThan(10);expect(resource.verifiedOn).toBe('2026-11-27');expect(resource.cautions.length).toBeGreaterThan(0);}
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
 it('surfaces Delhi Employment Exchange only for Delhi profiles',()=>{
  const delhi=matchVerifiedResources({occupation:'security guard',skills:'CCTV',goal:'better',location:'Delhi'});
  const jaipur=matchVerifiedResources({occupation:'security guard',skills:'CCTV',goal:'better',location:'Jaipur'});
  expect(delhi[0].id).toBe('delhi-employment');
  expect(jaipur.some(x=>x.id==='delhi-employment')).toBe(false);
 });
 it('does not fabricate city-specific listings for other cities',()=>{
  const jaipur=matchVerifiedResources({occupation:'student',skills:'',goal:'skills',location:'Jaipur'});
  const kochi=matchVerifiedResources({occupation:'student',skills:'',goal:'skills',location:'Kochi'});
  expect(jaipur.map(x=>x.id)).toEqual(kochi.map(x=>x.id));
  expect(jaipur.every(x=>x.geography==='India-wide')).toBe(true);
 });
});
