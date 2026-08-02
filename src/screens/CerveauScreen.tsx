import React from "react";
import {View,Text,TouchableOpacity,StyleSheet} from "react-native";
export default function CerveauScreen({
  analyseCore,
  profilDavid,
  planActionRose,
  journalRose,
  genererProfilDavid,
  genererPlanActionRose,
  genererSyntheseHebdo,
  syntheseHebdo,
}: any) {
  return (
    <View>
      <Text style={styles.sectionTitle}>
        Cerveau de Rose
      </Text>

      <View style={styles.grid}>
        <Kpi
          label="Cerveau"
          value={`${analyseCore.scoreCerveau}%`}
        />

        <Kpi
          label="Mémoire"
          value={`${analyseCore.scoreMemoire}%`}
        />

        <Kpi
          label="Tâches actives"
          value={String(analyseCore.tasksActives)}
        />

        <Kpi
          label="Objectifs IA"
          value={String(analyseCore.goalsActifs)}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>
          Profil analysé
        </Text>

        <Text style={styles.text}>
          {profilDavid ||
            "Rose n’a pas encore généré de profil personnalisé."}
        </Text>

        <TouchableOpacity
          style={styles.mainButton}
          onPress={genererProfilDavid}
        >
          <Text style={styles.mainButtonText}>
            Générer le profil
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>
          Plan d’action de Rose
        </Text>

        {planActionRose.length === 0 && (
          <Text style={styles.text}>
            Aucun plan d’action généré.
          </Text>
        )}

        {planActionRose.map(
          (action: string, index: number) => (
            <Text
              key={`${action}-${index}`}
              style={styles.text}
            >
              {index + 1}. {action}
            </Text>
          )
        )}

        <TouchableOpacity
          style={styles.mainButton}
          onPress={genererPlanActionRose}
        >
          <Text style={styles.mainButtonText}>
            Générer un plan d’action
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>
          Synthèse hebdomadaire
        </Text>

        <Text style={styles.text}>
          {syntheseHebdo ||
            "Aucune synthèse hebdomadaire disponible."}
        </Text>

        <TouchableOpacity
          style={styles.mainButton}
          onPress={genererSyntheseHebdo}
        >
          <Text style={styles.mainButtonText}>
            Générer la synthèse
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>
          Journal interne de Rose
        </Text>

        {journalRose.length === 0 && (
          <Text style={styles.text}>
            Le journal interne est vide.
          </Text>
        )}

        {journalRose.map(
          (entree: string, index: number) => (
            <View
              key={`${entree}-${index}`}
              style={styles.journalItem}
            >
              <Text style={styles.text}>
                • {entree}
              </Text>
            </View>
          )
        )}
      </View>
    </View>
  );
}

const styles=StyleSheet.create({
sectionTitle:{color:"#f8fafc",fontSize:22,fontWeight:"800",marginBottom:12},
grid:{flexDirection:"row",flexWrap:"wrap",justifyContent:"space-between",marginBottom:4},
card:{backgroundColor:"#111827",borderWidth:1,borderColor:"#1e293b",borderRadius:18,padding:15,marginBottom:12},
label:{color:"#f9a8d4",fontSize:14,fontWeight:"800",marginBottom:8,marginTop:4},
text:{color:"#dbeafe",fontSize:14,lineHeight:21,marginBottom:5},
mainButton:{backgroundColor:"#be185d",borderRadius:14,paddingVertical:12,alignItems:"center",marginTop:10},
mainButtonText:{color:"#fff",fontWeight:"800"},
journalItem:{marginBottom:6},
kpi:{width:"48%",backgroundColor:"#111827",borderWidth:1,borderColor:"#1e293b",borderRadius:16,padding:14,marginBottom:10},
kpiValue:{color:"#f9a8d4",fontSize:22,fontWeight:"900"},
kpiLabel:{color:"#cbd5e1",fontSize:12,fontWeight:"700"},
});
function Kpi({label,value}:any){return <View style={styles.kpi}><Text style={styles.kpiValue}>{value}</Text><Text style={styles.kpiLabel}>{label}</Text></View>}