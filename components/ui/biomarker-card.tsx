import { StyleSheet, Text, View } from "react-native";

export default function BiomarkerCard({
  icon,
  label,
  value,
  numberOfLines = 1,
  customWidth = undefined,
  variant = "column",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  numberOfLines?: number;
  customWidth?: number;
  variant?: "row" | "column";
}) {
  return (
    <View
      style={[
        styles.bioCard,
        customWidth ? { width: `${customWidth}%` } : undefined,
        variant === "row" && {
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          alignContent: "center",
          gap: 10,
        },
      ]}
    >
      <View style={styles.bioHeader}>
        {icon}
        <Text style={styles.bioLabel}>{label}</Text>
      </View>

      <Text
        style={styles.bioValue}
        numberOfLines={numberOfLines}
        ellipsizeMode="tail"
      >
        {value}
      </Text>
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
    gap: 5,
  },
  bioLabel: {
    color: "#aaa",
    fontSize: 12,
  },
  bioValue: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  bioHeader: {
    display: "flex",
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
});
