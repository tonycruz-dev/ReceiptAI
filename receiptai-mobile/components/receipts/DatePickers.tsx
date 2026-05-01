import React, { useState } from "react";
import { Platform, Pressable, Text, View } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

function formatDate(date: Date) {
  return date.toISOString().split("T")[0];
}

function DateField({
  label,
  value,
  onPress,
}: {
  label: string;
  value: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-1 rounded-2xl border border-slate-300 bg-white px-3 py-3"
      style={({ pressed }) => ({
        opacity: pressed ? 0.75 : 1,
      })}
    >
      <Text className="text-[11px] font-bold uppercase text-slate-500">
        {label}
      </Text>
      <Text className="mt-1 text-sm font-extrabold text-slate-950">
        {value || "Select"}
      </Text>
    </Pressable>
  );
}

export function DateRangePicker({
  fromDate,
  toDate,
  setFromDate,
  setToDate,
  setPage,
}: {
  fromDate: string;
  toDate: string;
  setFromDate: (value: string) => void;
  setToDate: (value: string) => void;
  setPage: React.Dispatch<React.SetStateAction<number>>;
}) {
  const [showFrom, setShowFrom] = useState(false);
  const [showTo, setShowTo] = useState(false);

  return (
    <View className="mt-3 flex-row gap-2">
      <DateField
        label="From"
        value={fromDate}
        onPress={() => setShowFrom(true)}
      />

      <DateField label="To" value={toDate} onPress={() => setShowTo(true)} />

      {showFrom && (
        <DateTimePicker
          value={fromDate ? new Date(fromDate) : new Date()}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(_, date) => {
            setShowFrom(false);
            if (date) {
              setPage(1);
              setFromDate(formatDate(date));
            }
          }}
        />
      )}

      {showTo && (
        <DateTimePicker
          value={toDate ? new Date(toDate) : new Date()}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(_, date) => {
            setShowTo(false);
            if (date) {
              setPage(1);
              setToDate(formatDate(date));
            }
          }}
        />
      )}
    </View>
  );
}

export function ExactDatePicker({
  selectedDate,
  setSelectedDate,
  setPage,
}: {
  selectedDate: string;
  setSelectedDate: (value: string) => void;
  setPage: React.Dispatch<React.SetStateAction<number>>;
}) {
  const [show, setShow] = useState(false);

  return (
    <View className="mt-3">
      <DateField
        label="Exact date"
        value={selectedDate}
        onPress={() => setShow(true)}
      />

      {show && (
        <DateTimePicker
          value={selectedDate ? new Date(selectedDate) : new Date()}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(_, date) => {
            setShow(false);
            if (date) {
              setPage(1);
              setSelectedDate(formatDate(date));
            }
          }}
        />
      )}
    </View>
  );
}
