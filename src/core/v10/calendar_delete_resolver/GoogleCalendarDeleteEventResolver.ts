import { GoogleSignin } from "@react-native-google-signin/google-signin";

export async function resolveGoogleCalendarEventForDelete(draft: { targetText?: string }) {
  const target = (draft?.targetText || "").toLowerCase();
  try {
    if (!(await GoogleSignin.hasPreviousSignIn()))
      return { resolved:false, confidence:0, text:"Google Calendar n’est pas connecté. Aucune suppression n’a été envoyée." };

    const { accessToken } = await GoogleSignin.getTokens();
    if (!accessToken) throw new Error("No Google access token");

    const timeMin = new Date().toISOString();
    const timeMax = new Date(Date.now()+60*24*3600*1000).toISOString();
    const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(timeMin)}&timeMax=${encodeURIComponent(timeMax)}&singleEvents=true&orderBy=startTime&maxResults=50`;
    const r = await fetch(url,{headers:{Authorization:`Bearer ${accessToken}`,Accept:"application/json"}});
    console.log(`[Rose V10-044B] DELETE RESOLVER GET / status=${r.status} / ok=${r.ok}`);
    if (!r.ok) throw new Error(`Google Calendar GET ${r.status}`);

    const data = await r.json();
    const words = target.normalize("NFD").replace(/[\u0300-\u036f]/g,"").split(/\W+/)
      .filter((w:string)=>w.length>2 && !["supprime","supprimer","rendez","vous","chez","samedi","agenda","calendar"].includes(w));
    const scored=(data.items||[]).map((e:any)=>{
      const text=`${e.summary||""} ${e.location||""} ${e.description||""}`.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
      const hits=words.filter((w:string)=>text.includes(w)).length;
      return {e,score:words.length?hits/words.length:0};
    }).sort((a:any,b:any)=>b.score-a.score);
    const best=scored[0];

    if(!best || best.score<0.34) {
      console.log(`[Rose V10-044B] DELETE RESOLVER RESULT / resolved=false / DELETE=NOT-SENT`);
      return {resolved:false,confidence:best?.score||0,text:"J’ai lu Google Calendar, mais je n’ai pas identifié le rendez-vous avec assez de certitude. Aucune suppression n’a été envoyée."};
    }

    const event={id:best.e.id,summary:best.e.summary,start:best.e.start?.dateTime||best.e.start?.date,end:best.e.end?.dateTime||best.e.end?.date,location:best.e.location};
    console.log(`[Rose V10-044B] DELETE RESOLVER RESULT / resolved=true / confidence=${best.score} / eventId=${event.id} / DELETE=NOT-SENT`);
    return {resolved:true,confidence:best.score,event,text:`J’ai retrouvé « ${event.summary} » dans Google Calendar. Je n’ai rien supprimé. Le véritable événement est identifié et une confirmation explicite sera nécessaire avant toute suppression.`};
  } catch(e:any) {
    return {resolved:false,confidence:0,text:"Je n’ai pas pu lire Google Calendar. Aucune suppression n’a été envoyée.",error:e?.message||String(e)};
  }
}
