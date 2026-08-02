import React from "react";
import {View,Text,TouchableOpacity,StyleSheet} from "react-native";
function Kpi({label,value}:any){return <View style={styles.kpi}><Text style={styles.kpiValue}>{value}</Text><Text style={styles.kpiLabel}>{label}</Text></View>}
export default function CoachScreen({
  analyseCore,
  habitudesRose,
  coachEntreprise,
  actionsRecommandees,
  analyserHabitudesRose,
  genererCoachEntreprise,
  genererActionsRecommandees,
}: any) {
  return (
    <View>
      <Text style={styles.sectionTitle}>
        Coach personnel
      </Text>

      <View style={styles.grid}>
        <Kpi
          label="Score Coach"
          value={`${analyseCore.scoreCoach}%`}
        />

        <Kpi
          label="Progression"
          value={`${analyseCore.progressionMoyenne}%`}
        />

        <Kpi
          label="Objectifs actifs"
          value={String(analyseCore.goalsActifs)}
        />

        <Kpi
          label="Tâches actives"
          value={String(analyseCore.tasksActives)}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>
          Analyse des habitudes
        </Text>

        {habitudesRose.length === 0 && (
          <Text style={styles.text}>
            Rose n’a pas encore analysé tes habitudes.
          </Text>
        )}

        {habitudesRose.map(
          (habitude: string, index: number) => (
            <Text
              key={`${habitude}-${index}`}
              style={styles.text}
            >
              • {habitude}
            </Text>
          )
        )}

        <TouchableOpacity
          style={styles.mainButton}
          onPress={analyserHabitudesRose}
        >
          <Text style={styles.mainButtonText}>
            Analyser mes habitudes
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>
          Coach entreprise
        </Text>

        <Text style={styles.text}>
          {coachEntreprise ||
            "Aucune analyse de l’entreprise disponible."}
        </Text>

        <TouchableOpacity
          style={styles.mainButton}
          onPress={genererCoachEntreprise}
        >
          <Text style={styles.mainButtonText}>
            Générer le coaching entreprise
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>
          Actions recommandées
        </Text>

        {actionsRecommandees.length === 0 && (
          <Text style={styles.text}>
            Aucune action recommandée pour le moment.
          </Text>
        )}

        {actionsRecommandees.map(
          (action: string, index: number) => (
            <View
              key={`${action}-${index}`}
              style={styles.journalItem}
            >
              <Text style={styles.text}>
                {index + 1}. {action}
              </Text>
            </View>
          )
        )}

        <TouchableOpacity
          style={styles.mainButton}
          onPress={genererActionsRecommandees}
        >
          <Text style={styles.mainButtonText}>
            Générer les actions prioritaires
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>
          Conseil du coach
        </Text>

        <Text style={styles.text}>
          Avance étape par étape, termine les actions les plus
          importantes et garde ton objectif principal visible.
        </Text>
      </View>
    </View>
  );
}
 
const styles=StyleSheet.create({sectionTitle:{color:"#f8fafc",fontSize:22,fontWeight:"800",marginBottom:12},grid:{flexDirection:"row",flexWrap:"wrap",justifyContent:"space-between",marginBottom:4},kpi:{width:"48%",backgroundColor:"#111827",borderWidth:1,borderColor:"#1e293b",borderRadius:16,padding:14,marginBottom:10},kpiValue:{color:"#f9a8d4",fontSize:22,fontWeight:"900"},kpiLabel:{color:"#cbd5e1",fontSize:12},card:{backgroundColor:"#111827",borderWidth:1,borderColor:"#1e293b",borderRadius:18,padding:15,marginBottom:12},label:{color:"#f9a8d4",fontWeight:"800",marginBottom:8},text:{color:"#dbeafe",fontSize:14,lineHeight:21},mainButton:{backgroundColor:"#be185d",borderRadius:14,padding:12,alignItems:"center",marginTop:10},mainButtonText:{color:"#fff",fontWeight:"800"},journalItem:{marginBottom:6}});