import React from "react";
import { Text, View } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { MiniButton } from "./MiniButton";
import { DateRangePicker, ExactDatePicker } from "./DatePickers";
import type { FilterOption } from "@/types/receipt";
import { filterOptions } from "@/types/receipt";

export function ReceiptFilters({
  filter,
  chooseFilter,
  category,
  setCategory,
  categories,
  fromDate,
  setFromDate,
  toDate,
  setToDate,
  selectedDate,
  setSelectedDate,
  setPage,
}: {
  filter: FilterOption;
  chooseFilter: (value: FilterOption) => void;
  category: string;
  setCategory: (value: string) => void;
  categories: string[];
  fromDate: string;
  setFromDate: (value: string) => void;
  toDate: string;
  setToDate: (value: string) => void;
  selectedDate: string;
  setSelectedDate: (value: string) => void;
  setPage: React.Dispatch<React.SetStateAction<number>>;
}) {
  return (
    <View className="my-4 rounded-[28px] border border-slate-300 bg-white p-4">
      <Text className="mb-3 text-xs font-black uppercase tracking-[3px] text-slate-500">
        Filter
      </Text>

      <View className="flex-row flex-wrap gap-2">
        {filterOptions.map(([value, label]) => (
          <MiniButton
            key={value}
            label={label}
            active={filter === value}
            onPress={() => chooseFilter(value)}
          />
        ))}
      </View>

      {filter === "category" && (
        <View className="mt-3 overflow-hidden rounded-2xl border border-slate-300 bg-slate-50">
          <Picker
            selectedValue={category}
            onValueChange={(value) => {
              setPage(1);
              setCategory(value);
            }}
          >
            <Picker.Item label="Select category" value="" />
            {categories.map((item) => (
              <Picker.Item key={item} label={item} value={item} />
            ))}
          </Picker>
        </View>
      )}

      {filter === "date-range" && (
        <DateRangePicker
          fromDate={fromDate}
          toDate={toDate}
          setFromDate={setFromDate}
          setToDate={setToDate}
          setPage={setPage}
        />
      )}

      {filter === "by-date" && (
        <ExactDatePicker
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          setPage={setPage}
        />
      )}
    </View>
  );
}
