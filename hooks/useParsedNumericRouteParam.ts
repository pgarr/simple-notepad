import { useLocalSearchParams } from 'expo-router';

type ParsedNumericRouteParam = {
  rawValue: string | undefined;
  value: number;
  isValid: boolean;
};

export function useParsedNumericRouteParam(
  key: string = 'id'
): ParsedNumericRouteParam {
  const params = useLocalSearchParams<Record<string, string | string[]>>();
  const paramValue = params[key];
  const rawValue = Array.isArray(paramValue) ? paramValue[0] : paramValue;
  const value = rawValue != null ? Number(rawValue) : Number.NaN;
  return {
    rawValue,
    value,
    isValid: !Number.isNaN(value),
  };
}
