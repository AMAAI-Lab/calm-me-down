import { StyleSheet, Text, View } from "react-native";

export default function BiomarkerCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.bioCard}>
      {icon}
      <Text style={styles.bioLabel}>{label}</Text>
      <Text style={styles.bioValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bioCard: {
    width: "48%",
    backgroundColor: "#181B24",
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#34373C",
  },
  bioLabel: {
    color: "#aaa",
    fontSize: 12,
    marginTop: 6,
  },
  bioValue: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 4,
  },
});
