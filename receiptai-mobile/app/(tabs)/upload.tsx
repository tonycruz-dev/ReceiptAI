// This file defines the UploadScreen component, which allows users 
// to upload a receipt image, extract details from it, and save the receipt to their records.
// The component uses the useState hook to manage various pieces of state related to the 
// receipt upload and extraction process, such as the selected file URI, extracted details, 
// loading state, and messages for the user.
// It includes functions to handle picking an image from the gallery, taking a photo with 
// the camera, uploading the image and extracting data from it, and saving the receipt. 
// The UI is structured in three main sections: selecting a receipt image, 
// previewing the uploaded image, and reviewing/extracting details before saving. 
// Each section includes relevant instructions and input fields for the user to interact with.
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { extractReceiptData, uploadReceiptImage } from "@/lib/api";
import { useReceipts } from "@/context/useReceipts";

export default function UploadScreen() {
  const { createReceipt } = useReceipts();

  const [fileUri, setFileUri] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imagePublicId, setImagePublicId] = useState("");
  const [merchantName, setMerchantName] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [currency, setCurrency] = useState("GBP");
  const [category, setCategory] = useState("Other");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  function resetExtractedState(selectedUri: string) {
    setFileUri(selectedUri);
    setImageUrl("");
    setImagePublicId("");
    setMerchantName("");
    setPurchaseDate("");
    setTotalAmount("");
    setCurrency("GBP");
    setCategory("Other");
    setMessage("");
  }

  async function handlePickImage() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permission needed", "Please allow photo access.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.9,
    });

    if (!result.canceled) {
      resetExtractedState(result.assets[0].uri);
    }
  }

  async function handleTakePhoto() {
    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permission needed", "Please allow camera access.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.9,
      cameraType: ImagePicker.CameraType.back,
    });

    if (!result.canceled) {
      resetExtractedState(result.assets[0].uri);
    }
  }

  async function handleUploadAndExtract() {
    if (!fileUri) {
      setMessage("Please select a receipt image first.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const uploadResult = await uploadReceiptImage(fileUri);

      if (!uploadResult.imageUrl || !uploadResult.publicId) {
        setMessage(uploadResult.errorMessage || "Image upload failed.");
        return;
      }

      setImageUrl(uploadResult.imageUrl);
      setImagePublicId(uploadResult.publicId);

      const extraction = await extractReceiptData({
        imageUrl: uploadResult.imageUrl,
      });

      if (extraction.errorMessage) {
        setMessage(extraction.errorMessage);
        return;
      }

      setMerchantName(extraction.merchantName || "");
      setPurchaseDate(
        extraction.purchaseDate ? extraction.purchaseDate.slice(0, 10) : ""
      );
      setTotalAmount(
        extraction.totalAmount !== null && extraction.totalAmount !== undefined
          ? String(extraction.totalAmount)
          : ""
      );
      setCurrency(extraction.currency || "GBP");
      setCategory(extraction.category || "Other");

      setMessage("Receipt extracted successfully. Review and save.");
    } catch {
      setMessage("Failed to upload and extract receipt.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!imageUrl || !imagePublicId) {
      setMessage("Upload an image first.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const id = await createReceipt({
        merchantName,
        purchaseDate: purchaseDate
          ? new Date(purchaseDate).toISOString()
          : new Date().toISOString(),
        totalAmount: Number(totalAmount),
        currency,
        category,
        imageUrl,
        imagePublicId,
      });

      router.push({
        pathname: "/receipts/[id]",
        params: { id },
      });
    } catch {
      setMessage("Failed to save receipt.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 32 }}>
        <Text className="text-xs font-semibold uppercase tracking-[3px] text-slate-500">
          Receipt Management
        </Text>
        <Text className="mt-2 text-4xl font-bold text-slate-900">
          Upload Receipt
        </Text>
        <Text className="mt-3 text-base leading-6 text-slate-600">
          Upload a receipt image, extract the details automatically, then review
          and save it to your records.
        </Text>

        <View
          className="mt-6 rounded-[28px] border border-slate-200 bg-white p-5"
          style={{
            shadowColor: "#0f172a",
            shadowOpacity: 0.05,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 4 },
            elevation: 1,
          }}
        >
          <Text className="text-lg font-semibold text-slate-900">
            1. Select your receipt
          </Text>
          <Text className="mt-1 text-sm text-slate-500">
            Use your camera or choose an image from your library.
          </Text>

          <View className="mt-5 rounded-[24px] border-2 border-dashed border-slate-300 bg-slate-50 px-5 py-10">
            <Text className="text-center text-base font-semibold text-slate-900">
              Choose receipt image
            </Text>
            <Text className="mt-2 text-center text-sm text-slate-500">
              Take a photo or browse your photo library
            </Text>

            <View className="mt-5 flex-row gap-3">
              <Pressable
                onPress={handlePickImage}
                className="flex-1 items-center rounded-2xl border border-slate-300 bg-white px-4 py-4"
              >
                <Text className="text-sm font-semibold text-slate-900">
                  Gallery
                </Text>
              </Pressable>

              <Pressable
                onPress={handleTakePhoto}
                className="flex-1 items-center rounded-2xl bg-slate-900 px-4 py-4"
              >
                <Text className="text-sm font-semibold text-white">Camera</Text>
              </Pressable>
            </View>

            <Text className="mt-4 text-center text-sm text-slate-600">
              {fileUri ? "Image selected" : "No file selected"}
            </Text>
          </View>

          <Pressable
            onPress={handleUploadAndExtract}
            disabled={loading || !fileUri}
            className={`mt-5 items-center rounded-2xl px-5 py-4 ${
              loading || !fileUri ? "bg-slate-300" : "bg-slate-900"
            }`}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className="text-sm font-semibold text-white">
                Upload and Extract
              </Text>
            )}
          </Pressable>

          {!!message && (
            <View className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <Text className="text-sm text-slate-700">{message}</Text>
            </View>
          )}
        </View>

        <View
          className="mt-6 rounded-[28px] border border-slate-200 bg-white p-5"
          style={{
            shadowColor: "#0f172a",
            shadowOpacity: 0.05,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 4 },
            elevation: 1,
          }}
        >
          <Text className="text-lg font-semibold text-slate-900">
            2. Receipt preview
          </Text>

          <View className="mt-4 overflow-hidden rounded-[24px] border border-slate-200 bg-slate-50">
            {imageUrl || fileUri ? (
              <Image
                source={{ uri: imageUrl || fileUri }}
                className="h-96 w-full"
                resizeMode="contain"
              />
            ) : (
              <View className="h-72 items-center justify-center px-6">
                <Text className="text-base font-semibold text-slate-900">
                  No preview yet
                </Text>
                <Text className="mt-2 text-center text-sm text-slate-500">
                  Upload a receipt image to preview it here.
                </Text>
              </View>
            )}
          </View>
        </View>

        <View
          className="mt-6 rounded-[28px] border border-slate-200 bg-white p-5"
          style={{
            shadowColor: "#0f172a",
            shadowOpacity: 0.05,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 4 },
            elevation: 1,
          }}
        >
          <Text className="text-lg font-semibold text-slate-900">
            3. Review extracted details
          </Text>

          <View className="mt-5 gap-4">
            <View>
              <Text className="mb-2 text-sm font-medium text-slate-700">
                Merchant name
              </Text>
              <TextInput
                value={merchantName}
                onChangeText={setMerchantName}
                placeholder="e.g. Tesco"
                placeholderTextColor="#94a3b8"
                className="rounded-2xl border border-slate-300 bg-white px-4 py-4 text-slate-900"
              />
            </View>

            <View>
              <Text className="mb-2 text-sm font-medium text-slate-700">
                Purchase date
              </Text>
              <TextInput
                value={purchaseDate}
                onChangeText={setPurchaseDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#94a3b8"
                className="rounded-2xl border border-slate-300 bg-white px-4 py-4 text-slate-900"
              />
            </View>

            <View>
              <Text className="mb-2 text-sm font-medium text-slate-700">
                Total amount
              </Text>
              <TextInput
                value={totalAmount}
                onChangeText={setTotalAmount}
                keyboardType="decimal-pad"
                placeholder="0.00"
                placeholderTextColor="#94a3b8"
                className="rounded-2xl border border-slate-300 bg-white px-4 py-4 text-slate-900"
              />
            </View>

            <View>
              <Text className="mb-2 text-sm font-medium text-slate-700">
                Currency
              </Text>
              <TextInput
                value={currency}
                onChangeText={setCurrency}
                placeholder="GBP"
                placeholderTextColor="#94a3b8"
                className="rounded-2xl border border-slate-300 bg-white px-4 py-4 text-slate-900"
              />
            </View>

            <View>
              <Text className="mb-2 text-sm font-medium text-slate-700">
                Category
              </Text>
              <TextInput
                value={category}
                onChangeText={setCategory}
                placeholder="Other"
                placeholderTextColor="#94a3b8"
                className="rounded-2xl border border-slate-300 bg-white px-4 py-4 text-slate-900"
              />
            </View>
          </View>

          <Pressable
            onPress={handleSave}
            disabled={loading || !imageUrl || !imagePublicId}
            className={`mt-6 items-center rounded-2xl px-5 py-4 ${
              loading || !imageUrl || !imagePublicId
                ? "bg-slate-300"
                : "bg-slate-900"
            }`}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className="text-sm font-semibold text-white">
                Save Receipt
              </Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
