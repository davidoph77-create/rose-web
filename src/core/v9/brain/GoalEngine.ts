import { BrainV2Context, BrainV2Goal, BrainV2Priority } from "./BrainTypes";
export class BrainV2GoalEngine { readonly id="brain-v2-goal-engine"; readonly version="2.0.0"; propose(c:BrainV2Context):BrainV2Goal[]{ if(!c.needsGoal&&c.intent!=="business")return []; const domain=c.domains[0]??"general"; const priority=this.fromUrgency(c.urgency); return [{id:this.idv("brain-goal"),title:this.title(c),description:`Objectif proposé à partir de la demande : "${c.message}"`,domain,priority,status:"proposed",progress:0,source:"brain",requiresValidation:true,createdAt:new Date().toISOString()}]; }
 private title(c:BrainV2Context){ switch(c.intent){case"business":return"Faire progresser l’objectif entreprise";case"project":return"Faire progresser le projet";case"goal":return"Structurer l’objectif demandé";case"plan":return"Transformer la demande en plan d’action";default:return"Objectif proposé par Rose";} }
 private fromUrgency(u:BrainV2Context["urgency"]):BrainV2Priority{ return u==="immediate"?"critical":u==="high"?"high":u==="low"?"low":"medium"; }
 private idv(p:string){return `${p}-${Date.now()}-${Math.random().toString(36).slice(2,9)}`;}
}
