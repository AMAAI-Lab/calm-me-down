import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { SpotifyTrack } from "@/constants/appConstants";

import { formaTrackDuration } from "@/util/commonUtils";

interface TrackCardProps {
  track: SpotifyTrack;
  index: number;
  onPress: () => void;
}

export default function TrackCard({ track, index, onPress }: TrackCardProps) {
  const albumArt = track.album.images[0]?.url;
  const artistNames = track.artists.map((a) => a.name).join(", ");

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={styles.trackCard}
    >
      <Text style={styles.trackIndex}>
        {String(index + 1).padStart(2, "0")}
      </Text>

      {albumArt ? (
        <Image source={{ uri: albumArt }} style={styles.albumArt} />
      ) : (
        <View style={[styles.albumArt, styles.albumArtFallback]}>
          <Text style={{ fontSize: 24 }}>🎵</Text>
        </View>
      )}

      <View style={styles.trackInfo}>
        <Text style={styles.trackName} numberOfLines={1}>
          {track.name}
        </Text>
        <Text style={styles.trackArtist} numberOfLines={1}>
          {artistNames}
        </Text>
        <Text style={styles.trackAlbum} numberOfLines={1}>
          {track.album.name}
        </Text>
      </View>

      <View style={styles.trackRight}>
        <Text style={styles.trackDuration}>
          {formaTrackDuration(track.duration_ms)}
        </Text>
        <View style={styles.spotifyDot}>
          <FontAwesome5 name="play" size={11} color="#000"></FontAwesome5>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  trackCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 6,
    backgroundColor: "#141417",
    borderRadius: 14,
  },
  trackIndex: {
    color: "#888",
    fontSize: 11,
    fontWeight: "700",
    width: 20,
    textAlign: "center",
    fontVariant: ["tabular-nums"],
  },
  albumArt: {
    width: 50,
    height: 50,
    borderRadius: 8,
  },
  albumArtFallback: {
    backgroundColor: "#1A1A1F",
    alignItems: "center",
    justifyContent: "center",
  },
  trackInfo: {
    flex: 1,
  },
  trackName: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: -0.2,
  },
  trackArtist: {
    color: "#888",
    fontSize: 12,
    marginTop: 2,
  },
  trackAlbum: {
    color: "#555",
    fontSize: 11,
    marginTop: 1,
  },
  trackRight: {
    alignItems: "center",
    gap: 4,
  },
  trackDuration: {
    color: "#555",
    fontSize: 11,
    fontVariant: ["tabular-nums"],
  },
  spotifyDot: {
    width: 28,
    height: 28,
    borderRadius: 999,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1DB954",
  },
});
