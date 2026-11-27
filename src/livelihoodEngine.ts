export type ContractStatus = 'unknown' | 'allowed' | 'approval' | 'restricted';
export type EnergyLevel = 'unknown' | 'good' | 'low' | 'exhausted';
export type OpportunityStatus = 'fit' | 'check' | 'avoid';
export type Pathway = 'primary-income' | 'supplementary-income' | 'independent-livelihood' | 'capability-development';
export type Profile = {
  occupation: string; goal: string; hoursPerDay: number | null; commuteMinutes: number | null;
  daysOff: number | null; energy: EnergyLevel; contract: ContractStatus; skills: string;
  device: 'smartphone' | 'limited' | 'computer' | 'none'; budget: number | null;
  location: string; family: string;
};
export type Opportunity = {
  id: string; title: string; pathway: Pathway; why: string; time: string; cost: string;
  checks: string[]; next: string; status: OpportunityStatus; score: number; matchedSignals: string[];
};
type Candidate = Omit<Opportunity, 'status' | 'score' | 'matchedSignals'> & {
  tags: string[]; effort: 'low' | 'moderate' | 'high'; minBudget: number;
  requiresDigital: boolean; contractSensitive: boolean; physical: boolean;
};
const catalogue: Candidate[] = [
 {id:'primary-review',title:'Compare better-paid roles in your current field',pathway:'primary-income',why:'Improving pay, stability or conditions in the work you already know may be safer than adding another shift.',time:'Short search and comparison sessions outside duty hours',cost:'No recruitment fee; include travel and lost-wage costs in comparisons.',checks:['Verify the employer, written terms, take-home pay, payment reliability and working conditions.','Check notice period, conflicts and any required disclosure.'],next:'Write down your current duties and compare them with three genuine openings.',tags:['all'],effort:'low',minBudget:0,requiresDigital:false,contractSensitive:false,physical:false},
 {id:'primary-progression',title:'Map a progression step within your occupation',pathway:'primary-income',why:'Existing practical knowledge may transfer into a senior, specialist, coordinator or supervisory role; actual entry requirements must be checked.',time:'Small learning or evidence-building sessions when rested',cost:'Start with employer-supported or free learning; verify fees before enrolling.',checks:['Do not assume a certificate guarantees promotion or a wage increase.','Confirm the role's real qualification, language and experience requirements.'],next:'Find two people doing the next role and list the skills they use.',tags:['all'],effort:'moderate',minBudget:0,requiresDigital:false,contractSensitive:false,physical:false},
 {id:'adjacent-role',title:'Explore an adjacent role using transferable skills',pathway:'capability-development',why:'Problem-solving, reliability, customer handling, coordination, care, repair and practical skills can transfer across industries.',time:'Flexible, self-paced exploration',cost:'Begin with free information interviews and practice; avoid paid courses until requirements are verified.',checks:['Check literacy, language, physical and credential requirements rather than assuming them.','A learning path is not a promise of a job.'],next:'Describe three tasks you do well and match them to roles that use those tasks.',tags:['all'],effort:'moderate',minBudget:0,requiresDigital:false,contractSensitive:false,physical:false},
 {id:'skill-proof',title:'Build a small proof of skill',pathway:'capability-development',why:'A practical demonstration can help a person test interest and show capability without committing to a full career change.',time:'One small task at a pace you choose',cost:'Use tools and materials already available; no purchase is required to begin.',checks:['Choose a task that does not expose personal, employer or customer data.','Do not work unpaid on deliverables that should be paid work.'],next:'Choose one real-world task and define what a useful finished result looks like.',tags:['all'],effort:'low',minBudget:0,requiresDigital:false,contractSensitive:false,physical:false},
 {id:'customer-test',title:'Test demand for a small independent service',pathway:'independent-livelihood',why:'A conversation-led, no-spend test can reveal whether people have a problem they would actually pay to solve.',time:'Only after confirming time, energy and household fit',cost:'₹0 discovery test; do not buy stock, borrow or use emergency savings.',checks:['Check local permissions, safety, pricing, delivery costs and customer willingness to pay.','Do not rely on compliments as proof of demand.'],next:'Speak with five potential customers before spending anything.',tags:['all','business'],effort:'moderate',minBudget:0,requiresDigital:false,contractSensitive:true,physical:false},
 {id:'local-trade',title:'Explore a local trade or repair service',pathway:'independent-livelihood',why:'Practical experience may support a small service offer, but safety, tools, skill verification and local demand matter.',time:'Start with observation and supervised practice',cost:'Do not buy tools until demand, safe competence and total costs are established.',checks:['Do not perform regulated or hazardous work without appropriate training and authorisation.','Check customer demand, liability, transport and material costs.'],next:'List services you can already perform safely and ask potential customers what they need.',tags:['trade','repair','mason','construction','electric','plumb','tailor','beauty','cook'],effort:'moderate',minBudget:0,requiresDigital:false,contractSensitive:true,physical:true},
 {id:'digital-service',title:'Explore a simple digital service',pathway:'independent-livelihood',why:'For people with suitable device access and interest, a small digital service can be tested before investing in equipment or advertising.',time:'Flexible practice sessions; only if device access is reliable',cost:'Start with free tools and existing devices; no paid subscriptions required.',checks:['Check client demand, data privacy, platform fees and realistic delivery time.','Never use employer devices, confidential data or contracted work hours.'],next:'Create one sample using fictional data and ask for feedback.',tags:['digital','computer','design','writing','excel','phone','online','office'],effort:'moderate',minBudget:0,requiresDigital:true,contractSensitive:true,physical:false},
 {id:'supplementary-flex',title:'Assess a genuinely flexible supplementary activity',pathway:'supplementary-income',why:'An additional income stream is considered only when time, rest, safety and contract conditions make it feasible.',time:'Only from confirmed discretionary time—not assumed free hours',cost:'Prefer no-upfront-cost options; account for travel, materials and platform fees.',checks:['Check exclusivity, moonlighting, approval, conflicts, confidentiality and IP terms.','Never work during contracted hours or safety-critical duties.'],next:'Confirm permitted hours and identify time that does not reduce essential rest.',tags:['all'],effort:'moderate',minBudget:0,requiresDigital:false,contractSensitive:true,physical:false},
 {id:'seasonal-work',title:'Explore seasonal or intermittent work',pathway:'supplementary-income',why:'Irregular or seasonal opportunities may fit some schedules, but availability and income can vary substantially.',time:'Only during confirmed available periods',cost:'Verify travel, materials, registration and payment terms before accepting.',checks:['Do not treat seasonal earnings as guaranteed monthly income.','Protect recovery time and existing responsibilities.'],next:'Identify local seasonal demand and verify the employer or buyer before committing.',tags:['seasonal','farm','agri','tourism','festival','craft','all'],effort:'moderate',minBudget:0,requiresDigital:false,contractSensitive:true,physical:true},
 {id:'digital-learning',title:'Explore a digital confidence pathway',pathway:'capability-development',why:'Basic digital confidence may widen access to services, learning and work—but it is not required for every livelihood.',time:'Short sessions with a text, audio or in-person alternative',cost:'Use free public or community learning resources where available.',checks:['Do not assume a smartphone, data plan, literacy or reliable connectivity.','Select a learning format that is accessible and comfortable.'],next:'Choose one everyday task you would like to do more independently.',tags:['digital','computer','phone','online','office','all'],effort:'low',minBudget:0,requiresDigital:false,contractSensitive:false,physical:false},
 {id:'care-community',title:'Explore community-based or care-related work',pathway:'primary-income',why:'Experience in care, teaching, cooking, coordination or community support may transfer to paid roles when qualifications and safeguards match.',time:'Explore actual role requirements before training',cost:'Avoid paying intermediaries; check recognised training and screening costs.',checks:['Safeguarding, background checks and role-specific qualifications may apply.','Do not turn unpaid family care into assumed available labour.'],next:'List the care, teaching or coordination tasks you have experience with and verify local role requirements.',tags:['care','teach','teacher','child','elder','community','cook'],effort:'moderate',minBudget:0,requiresDigital:false,contractSensitive:false,physical:false},
 {id:'formal-training',title:'Check a recognised, subsidised training route',pathway:'capability-development',why:'A verified public, employer-supported or subsidised course may help close a specific skills gap.',time:'Compare schedule, travel and attendance requirements first',cost:'Confirm total fees, stipend, materials, travel and refund terms directly with provider.',checks:['Verify provider recognition, eligibility, placement claims and current batch details.','Do not borrow or pay an agent based on an unverified promise.'],next:'Identify one target role, then ask its employers which credentials they actually accept.',tags:['all'],effort:'moderate',minBudget:0,requiresDigital:false,contractSensitive:false,physical:false}
];
const words = (s:string) => s.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
function goalAllows(p:Profile, pathway:Pathway) {
 if (p.goal === 'better') return pathway === 'primary-income' || pathway === 'capability-development';
 if (p.goal === 'business') return pathway === 'independent-livelihood' || pathway === 'capability-development';
 if (p.goal === 'skills') return pathway === 'capability-development' || pathway === 'primary-income';
 return true;
}
export function assessProfile(p:Profile) {
 const questions:string[]=[];
 if (!p.occupation.trim()) questions.push('What work, unpaid responsibilities or daily activities currently take most of your time?');
 if (p.hoursPerDay === null) questions.push('How many hours do you usually spend working each day, including variable or seasonal work?');
 if (p.energy === 'unknown') questions.push('How do you usually feel after your work and commute: rested, somewhat tired or exhausted?');
 if (p.contract === 'unknown') questions.push('Do any contract, employer, client or platform rules restrict outside work or require approval?');
 if (p.daysOff === null) questions.push('Do you have regular days off, and are they genuinely available for other activities?');
 if (p.budget === null) questions.push('Would you prefer to explore with ₹0 upfront spending, or is there a safe amount you can afford to lose?');
 if (!p.location.trim()) questions.push('Which city, district or area should local opportunities be checked in?');
 return questions;
}
export function recommendOpportunities(p:Profile, source:Candidate[] = catalogue):Opportunity[] {
 const q = words(p.occupation + ' ' + p.skills);
 const longHours = p.hoursPerDay !== null && p.hoursPerDay >= 10;
 const noRest = p.daysOff === 0;
 const depleted = p.energy === 'low' || p.energy === 'exhausted';
 const digitalUnavailable = p.device === 'none' || p.device === 'limited';
 return source.filter(c => goalAllows(p,c.pathway)).map(c => {
   const matched = c.tags.includes('all') ? [] : c.tags.filter(t => q.some(w => w.includes(t) || t.includes(w)));
   const relevant = c.tags.includes('all') || matched.length > 0;
   let status:OpportunityStatus = 'fit';
   const checks = [...c.checks];
   let score = 35 + (relevant ? 20 : 0);
   if (c.pathway === 'primary-income') score += 12;
   if (c.pathway === 'capability-development') score += 7;
   if (p.energy === 'good') score += 5;
   if (p.budget === 0 && c.minBudget === 0) score += 5;
   if (c.requiresDigital && digitalUnavailable) { status = 'avoid'; checks.unshift('This option currently requires reliable digital access; use an offline alternative or revisit if access changes.'); score -= 35; }
   if (c.effort === 'high' && (longHours || depleted || noRest)) { status = 'avoid'; checks.unshift('Current work hours, rest or energy make this additional workload unsuitable right now.'); score -= 40; }
   if (c.pathway === 'supplementary-income' && (longHours || depleted || noRest)) { status = 'avoid'; checks.unshift('Do not add another shift while work hours are long, recovery is limited or energy is depleted.'); score -= 50; }
   if (c.pathway === 'supplementary-income' && p.hoursPerDay === null) { status = 'check'; checks.unshift('Working hours are unknown; do not assume spare time exists.'); }
   if (c.pathway === 'supplementary-income' && p.daysOff === null) { status = 'check'; checks.unshift('Days off and actual recovery time are unknown.'); }
   if (c.contractSensitive && p.contract === 'unknown') { status = status === 'avoid' ? status : 'check'; checks.unshift('Contract and outside-work policy are unknown; clarify them before pursuing this option.'); }
   if (c.contractSensitive && (p.contract === 'approval' || p.contract === 'restricted')) { status = 'avoid'; checks.unshift('Outside work may require written approval or be restricted. Do not proceed unless the relevant authority confirms permission.'); score -= 45; }
   if (p.budget === null && c.minBudget > 0) { status = status === 'avoid' ? status : 'check'; checks.unshift('Affordable budget is unknown; no spending recommendation can be made.'); }
   if (p.location.trim() === '' && (c.pathway === 'primary-income' || c.pathway === 'independent-livelihood')) { status = status === 'avoid' ? status : 'check'; }
   return {id:c.id,title:c.title,pathway:c.pathway,why:c.why,time:c.time,cost:c.cost,checks,next:c.next,status,score,matchedSignals:matched};
 }).sort((a,b) => (a.status === 'avoid' ? 1 : 0) - (b.status === 'avoid' ? 1 : 0) || b.score-a.score);
}
export function pathwayLabel(p:Pathway) {
 return ({'primary-income':'Improve primary income','supplementary-income':'Supplementary income','independent-livelihood':'Independent livelihood','capability-development':'Capability development'})[p];
}
