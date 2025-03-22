import { Link, Stack } from "expo-router";
import * as React from 'react';
import { StyleSheet } from "react-native";
import { Text, View } from "tamagui";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Oops!" }} />
      <View style={styles.container}>
        <Text ff='$heading'>This screen doesn't exist.</Text>
        <Link href="/" style={styles.link}>
          <Text ff='$body'>Go to home screen!</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
});
