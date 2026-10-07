import React, { useState } from "react";
import { Modal, View, Text, Pressable, StyleSheet, Alert } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import CommonButton from "./common-button";
import { useAuth } from "@/context/AuthContext";
import { shareLogs, viewLogs } from "@/services/LoggerService";
import { useNavigation } from "expo-router";

interface DebugOptionsModalProps {
  clearStates?: () => void;
  songQueueLen?: number;
  isHomeScreen?: boolean;
}

export default function DebugOptionsModal({
  clearStates,
  songQueueLen = 0,
  isHomeScreen = false,
}: DebugOptionsModalProps) {
  const { logout } = useAuth();
  const navigation = useNavigation();

  const [debugModalVisible, setDebugModalVisible] = useState(false);

  const closeDebugModal = () => setDebugModalVisible(false);
  const handleLogout = () => {
    logout();
    navigation.navigate("Login" as never);
  };
  const checkEnvVars = () => {
    const ENV = {
      CLAUDE_API_KEY: process.env.EXPO_PUBLIC_CLAUDE_API_KEY,
      OPENWEATHER_API_KEY: process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY,
    };
    const { CLAUDE_API_KEY, OPENWEATHER_API_KEY } = ENV;
    Alert.alert(
      "ENV Variables:",
      `-> OPENWEATHER_API_KEY : ${OPENWEATHER_API_KEY} -> CLAUDE_API_KEY: ${CLAUDE_API_KEY}`,
    );
  };

  return (
    <>
      <Pressable
        style={styles.optionsTrigger}
        onPress={() => setDebugModalVisible(true)}
      >
        <FontAwesome5 name="ellipsis-h" size={25} color="#fff" />
      </Pressable>

      {debugModalVisible && (
        <Modal
          visible={debugModalVisible}
          transparent
          animationType="slide"
          onRequestClose={closeDebugModal}
        >
          {/* Backdrop */}
          <Pressable style={styles.backdrop} onPress={closeDebugModal} />

          <View style={styles.sheet}>
            <View style={styles.handle} />

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Text style={styles.sheetTitle}>Debug Options</Text>
              <CommonButton
                onPress={closeDebugModal}
                icon={<FontAwesome5 name="times" size={22} color="#fff" />}
              />
            </View>

            {/* Logout */}
            <View style={[styles.row, { opacity: 0.8, marginBottom: -20 }]}>
              <Text style={styles.rowLabel}>Logout</Text>
              <CommonButton
                onPress={() => {
                  closeDebugModal();
                  handleLogout();
                }}
                icon={
                  <FontAwesome5 name="sign-out-alt" size={18} color="#fff" />
                }
              />
            </View>

            {/* Verify API Keys */}
            {isHomeScreen && (
              <View style={[styles.row, { opacity: 0.8, marginBottom: -20 }]}>
                <Text style={styles.rowLabel}>Verify API keys</Text>
                <CommonButton
                  onPress={checkEnvVars}
                  icon={<FontAwesome5 name="question" size={18} color="#fff" />}
                />
              </View>
            )}

            {/* Reset current playlist */}
            {!isHomeScreen && (
              <View style={[styles.row, { opacity: 0.8, marginBottom: -20 }]}>
                <Text style={styles.rowLabel}>Reset current playlist</Text>
                <CommonButton
                  onPress={() => {
                    closeDebugModal();
                    clearStates?.();
                  }}
                  icon={<FontAwesome5 name="redo" size={18} color="#fff" />}
                  disabled={!songQueueLen}
                />
              </View>
            )}

            {/* View / Share logs */}
            <View style={[styles.row, { opacity: 0.8 }]}>
              <Text style={styles.rowLabel}>View logs</Text>
              <CommonButton
                onPress={viewLogs}
                icon={<FontAwesome5 name="eye" size={22} color="#fff" />}
              />
              <Text style={[styles.rowLabel, { marginLeft: 15 }]}>
                Share logs
              </Text>
              <CommonButton
                onPress={shareLogs}
                icon={<FontAwesome5 name="share" size={22} color="#fff" />}
              />
            </View>
          </View>
        </Modal>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  optionsTrigger: {
    alignSelf: "center",
    marginTop: 70,
    opacity: 0.5,
    padding: 10,
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  sheet: {
    backgroundColor: "#190d2d",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 30,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginBottom: 15,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#ece5e5",
    opacity: 0.3,
    alignSelf: "center",
    marginBottom: 12,
  },
  sheetTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  rowLabel: {
    color: "#ece5e5",
    fontSize: 13,
  },
  debugBtn: {
    borderWidth: 1,
    borderColor: "#B07FE0",
    backgroundColor: "#1E1235",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 8,
  },
  debugBtnText: {
    color: "#B07FE0",
    fontSize: 16,
  },
});
