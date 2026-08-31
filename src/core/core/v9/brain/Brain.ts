import { BrainV2Input, BrainV2Output } from "./BrainTypes"; import { BrainV2Orchestrator } from "./BrainOrchestrator";
export class RoseBrainV2 { readonly id="rose-brain-v2"; readonly name="Rose Brain Core V2"; readonly version="9.0.2"; private readonly orchestrator=new BrainV2Orchestrator(); analyze(input:BrainV2Input):BrainV2Output{if(!input.message?.trim())throw new Error("Rose Brain V2 : le message est vide."); return this.orchestrator.run(input);} }
export const roseBrainV2=new RoseBrainV2();
