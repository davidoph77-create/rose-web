import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ScrollView, Share, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { listAuditReports, formatAuditReport } from "../core/v10/audit_report";
import type { AuditReport } from "../core/v10/audit_report";

type RiskFilter = "all" | "low" | "medium" | "high";

export default function AuditHistoryScreen() {
  const [reports, setReports] = useState<AuditReport[]>([]);
  const [selected, setSelected] = useState<AuditReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastExportedId, setLastExportedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [riskFilter, setRiskFilter] = useState<RiskFilter>("all");

  const charger = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listAuditReports();
      setReports(data);
      if (selected && !data.find((item) => item.id === selected.id)) setSelected(null);
    } finally { setLoading(false); }
  }, [selected]);

  useEffect(() => { charger(); }, []);

  const partagerRapport = async (report: AuditReport) => {
    await Share.share({ title: `Rose Audit ${report.id}`, message: formatAuditReport(report) });
    setLastExportedId(report.id);
  };

  const filteredReports = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return reports.filter((report) => {
      const matchesRisk = riskFilter === "all" || report.overallRisk === riskFilter;
      if (!matchesRisk) return false;
      if (!normalized) return true;
      const haystack = [report.id, report.summary, report.overallRisk, ...report.entries.map((entry) => [entry.adapterId, entry.capability, entry.verificationStatus, entry.integrityHash, entry.risk].join(" "))].join(" ").toLowerCase();
      return haystack.includes(normalized);
    });
  }, [reports, query, riskFilter]);

  const dashboard = useMemo(() => {
    const totalEvidence = reports.reduce((s,r)=>s+(r.totalEvidence??0),0);
    const verifiedEvidence = reports.reduce((s,r)=>s+(r.verifiedEvidence??0),0);
    const failedEvidence = reports.reduce((s,r)=>s+(r.failedEvidence??0),0);
    const alteredEvidence = reports.reduce((s,r)=>s+(r.alteredEvidence??0),0);
    const externalDetected = reports.reduce((s,r)=>s+r.entries.filter(e=>e.externalExecutionDetected).length,0);
    const low = reports.filter(r=>r.overallRisk==="low").length;
    const medium = reports.filter(r=>r.overallRisk==="medium").length;
    const high = reports.filter(r=>r.overallRisk==="high").length;
    const integrityRate = totalEvidence > 0 ? Math.round((verifiedEvidence/totalEvidence)*100) : 100;
    return {totalReports:reports.length,totalEvidence,verifiedEvidence,failedEvidence,alteredEvidence,externalDetected,low,medium,high,integrityRate};
  }, [reports]);

  return <View style={styles.container}>
    <Text style={styles.title}>Historique Audit V10</Text>
    <Text style={styles.subtitle}>V10-034 ajoute le tableau de bord statistique des audits : rapports, preuves, intégrité, échecs, altérations et niveaux de risque.</Text>

    <View style={styles.dashboardGrid}>
      <DashboardCard label="Rapports" value={dashboard.totalReports}/>
      <DashboardCard label="Preuves" value={dashboard.totalEvidence}/>
      <DashboardCard label="Vérifiées" value={dashboard.verifiedEvidence}/>
      <DashboardCard label="Intégrité" value={`${dashboard.integrityRate}%`}/>
      <DashboardCard label="Échecs" value={dashboard.failedEvidence}/>
      <DashboardCard label="Altérées" value={dashboard.alteredEvidence}/>
    </View>

    <View style={styles.securityCard}>
      <Text style={styles.securityTitle}>Résumé sécurité</Text>
      <Text style={styles.securityLine}>LOW : {dashboard.low} • MEDIUM : {dashboard.medium} • HIGH : {dashboard.high}</Text>
      <Text style={styles.securityLine}>Exécutions externes détectées : {dashboard.externalDetected}</Text>
      <Text style={[styles.securityStatus,(dashboard.high>0||dashboard.alteredEvidence>0||dashboard.externalDetected>0)&&styles.securityStatusWarning]}>
        {dashboard.high>0||dashboard.alteredEvidence>0||dashboard.externalDetected>0 ? "ATTENTION : vérification recommandée." : "ÉTAT AUDIT : STABLE."}
      </Text>
    </View>

    <View style={styles.stats}><Stat label="LOW" value={dashboard.low}/><Stat label="MEDIUM" value={dashboard.medium}/><Stat label="HIGH" value={dashboard.high}/></View>

    <TextInput value={query} onChangeText={setQuery} placeholder="Rechercher id, adapter, hash..." placeholderTextColor="#64748b" style={styles.searchInput} autoCapitalize="none" autoCorrect={false}/>
    <View style={styles.filters}>
      <FilterButton label="TOUS" active={riskFilter==="all"} onPress={()=>setRiskFilter("all")}/>
      <FilterButton label="LOW" active={riskFilter==="low"} onPress={()=>setRiskFilter("low")}/>
      <FilterButton label="MEDIUM" active={riskFilter==="medium"} onPress={()=>setRiskFilter("medium")}/>
      <FilterButton label="HIGH" active={riskFilter==="high"} onPress={()=>setRiskFilter("high")}/>
    </View>
    <View style={styles.toolbar}><TouchableOpacity style={styles.refreshButton} onPress={charger}><Text style={styles.buttonText}>{loading?"Chargement...":"Actualiser"}</Text></TouchableOpacity><Text style={styles.resultCount}>{filteredReports.length} résultat(s)</Text></View>

    {selected ? <View style={styles.detailCard}>
      <View style={styles.detailHeader}><Text style={styles.detailTitle}>Détail du rapport</Text><TouchableOpacity onPress={()=>setSelected(null)}><Text style={styles.closeText}>Fermer</Text></TouchableOpacity></View>
      <Text style={styles.reportText}>{formatAuditReport(selected)}</Text>
      <TouchableOpacity style={styles.exportButton} onPress={()=>partagerRapport(selected)}><Text style={styles.buttonText}>Partager le rapport</Text></TouchableOpacity>
      {lastExportedId===selected.id ? <Text style={styles.exportNotice}>Snapshot d'audit prêt pour partage.</Text>:null}
      <Text style={styles.sectionTitle}>Entrées</Text>
      {selected.entries.map((entry)=><View key={entry.evidenceId} style={styles.entryCard}><Text style={styles.entryAdapter}>{entry.adapterId}</Text><Text style={styles.entryText}>Capacité : {entry.capability}</Text><Text style={styles.entryText}>Statut : {entry.verificationStatus}</Text><Text style={styles.entryText}>Risque : {entry.risk.toUpperCase()}</Text><Text style={styles.hash}>{entry.integrityHash}</Text><Text style={styles.safeNotice}>Exécution externe : {entry.externalExecutionDetected?"OUI":"NON"}</Text></View>)}
    </View>:null}

    {filteredReports.length===0 ? <View style={styles.empty}><Text style={styles.emptyText}>Aucun rapport ne correspond à la recherche.</Text></View> : <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>{filteredReports.map((report)=><View key={report.id} style={styles.card}><TouchableOpacity onPress={()=>setSelected(report)}><View style={styles.topRow}><View style={[styles.riskBadge,report.overallRisk==="medium"&&styles.riskMedium,report.overallRisk==="high"&&styles.riskHigh]}><Text style={styles.riskText}>{report.overallRisk.toUpperCase()}</Text></View><Text style={styles.date}>{new Date(report.generatedAt).toLocaleString()}</Text></View><Text style={styles.reportId}>{report.id}</Text><Text style={styles.summary}>{report.summary}</Text><Text style={styles.meta}>Preuves : {report.totalEvidence} • Vérifiées : {report.verifiedEvidence}</Text><Text style={styles.meta}>Échecs : {report.failedEvidence} • Altérées : {report.alteredEvidence}</Text><Text style={styles.openText}>Ouvrir le rapport</Text></TouchableOpacity><TouchableOpacity style={styles.smallExportButton} onPress={()=>partagerRapport(report)}><Text style={styles.smallExportText}>Exporter / Partager</Text></TouchableOpacity></View>)}</ScrollView>}
  </View>;
}

function DashboardCard({label,value}:{label:string;value:number|string}) { return <View style={styles.dashboardCard}><Text style={styles.dashboardValue}>{value}</Text><Text style={styles.dashboardLabel}>{label}</Text></View>; }
function Stat({label,value}:{label:string;value:number}) { return <View style={styles.stat}><Text style={styles.statValue}>{value}</Text><Text style={styles.statLabel}>{label}</Text></View>; }
function FilterButton({label,active,onPress}:{label:string;active:boolean;onPress:()=>void}) { return <TouchableOpacity onPress={onPress} style={[styles.filterButton,active&&styles.filterButtonActive]}><Text style={[styles.filterText,active&&styles.filterTextActive]}>{label}</Text></TouchableOpacity>; }

const styles = StyleSheet.create({
  container:{flex:1,paddingBottom:20}, title:{color:"#f8fafc",fontSize:22,fontWeight:"800",marginBottom:6}, subtitle:{color:"#94a3b8",fontSize:13,lineHeight:19,marginBottom:12},
  dashboardGrid:{flexDirection:"row",flexWrap:"wrap",gap:8,marginBottom:10}, dashboardCard:{width:"31%",minWidth:90,flexGrow:1,backgroundColor:"#111827",borderWidth:1,borderColor:"#1e293b",borderRadius:14,paddingVertical:12,paddingHorizontal:8,alignItems:"center"}, dashboardValue:{color:"#f9a8d4",fontSize:20,fontWeight:"900"}, dashboardLabel:{color:"#94a3b8",fontSize:10,marginTop:3,textAlign:"center"},
  securityCard:{backgroundColor:"#0f172a",borderWidth:1,borderColor:"#334155",borderRadius:14,padding:12,marginBottom:10},securityTitle:{color:"#f8fafc",fontWeight:"900",marginBottom:6},securityLine:{color:"#cbd5e1",fontSize:11,marginBottom:4},securityStatus:{color:"#86efac",fontSize:11,fontWeight:"900",marginTop:5},securityStatusWarning:{color:"#fbbf24"},
  stats:{flexDirection:"row",gap:8,marginBottom:12},stat:{flex:1,backgroundColor:"#111827",borderWidth:1,borderColor:"#1e293b",borderRadius:14,padding:10,alignItems:"center"},statValue:{color:"#f9a8d4",fontSize:20,fontWeight:"900"},statLabel:{color:"#94a3b8",fontSize:10,marginTop:3},
  searchInput:{backgroundColor:"#111827",borderWidth:1,borderColor:"#334155",borderRadius:12,color:"#f8fafc",paddingHorizontal:12,paddingVertical:10,marginBottom:10},filters:{flexDirection:"row",flexWrap:"wrap",gap:7,marginBottom:10},filterButton:{borderWidth:1,borderColor:"#334155",backgroundColor:"#111827",paddingVertical:7,paddingHorizontal:10,borderRadius:16},filterButtonActive:{backgroundColor:"#7c3aed",borderColor:"#a78bfa"},filterText:{color:"#94a3b8",fontSize:10,fontWeight:"900"},filterTextActive:{color:"#fff"},
  toolbar:{flexDirection:"row",alignItems:"center",justifyContent:"space-between",marginBottom:12},refreshButton:{backgroundColor:"#1d4ed8",borderRadius:12,paddingVertical:10,paddingHorizontal:14},resultCount:{color:"#94a3b8",fontSize:11,fontWeight:"800"},buttonText:{color:"#fff",fontWeight:"800",fontSize:12},
  empty:{backgroundColor:"#111827",borderWidth:1,borderColor:"#1e293b",borderRadius:16,padding:18},emptyText:{color:"#94a3b8"},list:{paddingBottom:80},card:{backgroundColor:"#111827",borderWidth:1,borderColor:"#1e293b",borderRadius:16,padding:14,marginBottom:10},topRow:{flexDirection:"row",justifyContent:"space-between",gap:10,alignItems:"center",marginBottom:8},riskBadge:{backgroundColor:"#166534",borderRadius:20,paddingVertical:5,paddingHorizontal:10},riskMedium:{backgroundColor:"#92400e"},riskHigh:{backgroundColor:"#991b1b"},riskText:{color:"#fff",fontSize:10,fontWeight:"900"},date:{color:"#64748b",fontSize:10},reportId:{color:"#93c5fd",fontSize:12,fontWeight:"900",marginBottom:7},summary:{color:"#e2e8f0",fontSize:12,lineHeight:18,marginBottom:8},meta:{color:"#94a3b8",fontSize:10,marginBottom:3},openText:{color:"#f9a8d4",fontSize:11,fontWeight:"900",marginTop:10},
  detailCard:{backgroundColor:"#0f172a",borderWidth:1,borderColor:"#7c3aed",borderRadius:16,padding:14,marginBottom:12},detailHeader:{flexDirection:"row",justifyContent:"space-between",marginBottom:8},detailTitle:{color:"#c4b5fd",fontSize:14,fontWeight:"900"},closeText:{color:"#f9a8d4",fontWeight:"900"},reportText:{color:"#e2e8f0",fontSize:11,lineHeight:17},exportButton:{alignSelf:"flex-start",backgroundColor:"#0f766e",borderRadius:12,paddingVertical:10,paddingHorizontal:14,marginTop:12},exportNotice:{color:"#86efac",fontSize:10,marginTop:8,fontWeight:"800"},smallExportButton:{alignSelf:"flex-start",marginTop:10,borderWidth:1,borderColor:"#0f766e",borderRadius:10,paddingVertical:7,paddingHorizontal:10},smallExportText:{color:"#5eead4",fontSize:10,fontWeight:"900"},sectionTitle:{color:"#f8fafc",fontSize:13,fontWeight:"900",marginTop:14,marginBottom:8},entryCard:{backgroundColor:"#111827",borderRadius:12,padding:10,marginBottom:8},entryAdapter:{color:"#93c5fd",fontWeight:"900",marginBottom:5},entryText:{color:"#cbd5e1",fontSize:10,marginBottom:3},hash:{color:"#f9a8d4",fontSize:10,fontWeight:"800",marginTop:5},safeNotice:{color:"#86efac",fontSize:10,marginTop:6}
});
