import React from "react";
import { Text, View } from "react-native";
import { ChromeButton } from "./ChromeButton";
import { StepBadge } from "./StepBadge";

export function SelectReceiptCard({
  fileUri,
  loading,
  message,
  onPickImage,
  onTakePhoto,
  onUploadAndExtract,
}: {
  fileUri: string;
  loading: boolean;
  message: string;
  onPickImage: () => void;
  onTakePhoto: () => void;
  onUploadAndExtract: () => void;
}) {
  return (
    <View className="mt-4 rounded-[32px] border border-slate-300 bg-white p-4">
      <View className="flex-row items-center gap-3">
        <StepBadge value="1" />
        <View>
          <Text className="text-lg font-black text-slate-950">
            Select receipt
          </Text>
          <Text className="text-xs font-semibold text-slate-500">
            Camera or gallery
          </Text>
        </View>
      </View>

      <View className="mt-4 rounded-[28px] border-2 border-dashed border-slate-400 bg-slate-100 p-5">
        <Text className="text-center text-lg font-black text-slate-950">
          {fileUri ? "Image ready" : "Choose an image"}
        </Text>

        <Text className="mt-1 text-center text-sm font-semibold text-slate-600">
          {fileUri
            ? "Now upload and extract the receipt data."
            : "Take a clear photo or select one from your gallery."}
        </Text>

        <View className="mt-5 flex-row gap-3">
          <View className="flex-1">
            <ChromeButton
              label="Gallery"
              onPress={onPickImage}
              variant="light"
              disabled={loading}
            />
          </View>

          <View className="flex-1">
            <ChromeButton
              label="Camera"
              onPress={onTakePhoto}
              disabled={loading}
            />
          </View>
        </View>
      </View>

      <View className="mt-4">
        <ChromeButton
          label="Upload and Extract"
          onPress={onUploadAndExtract}
          disabled={loading || !fileUri}
          loading={loading}
        />
      </View>

      {!!message && (
        <View className="mt-4 rounded-2xl border border-slate-300 bg-slate-100 px-4 py-3">
          <Text className="text-sm font-bold text-slate-800">{message}</Text>
        </View>
      )}
    </View>
  );
}
