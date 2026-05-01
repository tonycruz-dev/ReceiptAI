import React, { useState } from "react";
import { Alert, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { extractReceiptData, uploadReceiptImage } from "@/lib/api";
import { useReceipts } from "@/hooks/useReceipts";

import { UploadHeader } from "@/components/upload/UploadHeader";
import { SelectReceiptCard } from "@/components/upload/SelectReceiptCard";
import { ReceiptPreviewCard } from "@/components/upload/ReceiptPreviewCard";
import { ReviewDetailsCard } from "@/components/upload/ReviewDetailsCard";

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

      if (!uploadResult.url || !uploadResult.publicId) {
        setMessage(uploadResult.errorMessage || "Image upload failed.");
        return;
      }

      setImageUrl(uploadResult.url);
      setImagePublicId(uploadResult.publicId);

      const extraction = await extractReceiptData({
        imageUrl: uploadResult.url,
      });

      if (extraction.errorMessage) {
        setMessage(extraction.errorMessage);
        return;
      }

      setMerchantName(extraction.merchantName || "");
      setPurchaseDate(
        extraction.purchaseDate ? extraction.purchaseDate.slice(0, 10) : "",
      );
      setTotalAmount(
        extraction.totalAmount !== null && extraction.totalAmount !== undefined
          ? String(extraction.totalAmount)
          : "",
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
      await createReceipt({
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

      router.replace("/");
    } catch {
      setMessage("Failed to save receipt.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-slate-100">
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 140 }}>
        <UploadHeader
          imageUrl={imageUrl}
          fileUri={fileUri}
          currency={currency}
        />

        <SelectReceiptCard
          fileUri={fileUri}
          loading={loading}
          message={message}
          onPickImage={handlePickImage}
          onTakePhoto={handleTakePhoto}
          onUploadAndExtract={handleUploadAndExtract}
        />

        <ReceiptPreviewCard imageUrl={imageUrl} fileUri={fileUri} />

        <ReviewDetailsCard
          merchantName={merchantName}
          setMerchantName={setMerchantName}
          purchaseDate={purchaseDate}
          setPurchaseDate={setPurchaseDate}
          totalAmount={totalAmount}
          setTotalAmount={setTotalAmount}
          currency={currency}
          setCurrency={setCurrency}
          category={category}
          setCategory={setCategory}
          loading={loading}
          imageUrl={imageUrl}
          imagePublicId={imagePublicId}
          onSave={handleSave}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
