import { render } from '@testing-library/react-native';
import { useLocalSearchParams } from 'expo-router';
import { Text } from 'react-native';

import { useParsedNumericRouteParam } from '@/hooks/useParsedNumericRouteParam';

jest.mock('expo-router', () => ({
  useLocalSearchParams: jest.fn(),
}));

const mockedUseLocalSearchParams = useLocalSearchParams as unknown as jest.Mock;

function HookConsumer({ paramKey }: { paramKey: string }) {
  const { rawValue, value, isValid } = useParsedNumericRouteParam(paramKey);

  return (
    <>
      <Text testID="raw">{rawValue === undefined ? 'undefined' : String(rawValue)}</Text>
      <Text testID="value">{Number.isNaN(value) ? 'NaN' : String(value)}</Text>
      <Text testID="isValid">{String(isValid)}</Text>
    </>
  );
}

describe('hooks/useParsedNumericRouteParam', () => {
  afterEach(() => {
    mockedUseLocalSearchParams.mockReset();
  });

  it('returns invalid when param is missing', () => {
    mockedUseLocalSearchParams.mockReturnValue({});

    const { getByTestId } = render(<HookConsumer paramKey="id" />);

    expect(getByTestId('raw').props.children).toBe('undefined');
    expect(getByTestId('value').props.children).toBe('NaN');
    expect(getByTestId('isValid').props.children).toBe('false');
  });

  it('parses a numeric string param', () => {
    mockedUseLocalSearchParams.mockReturnValue({ id: '12' });

    const { getByTestId } = render(<HookConsumer paramKey="id" />);

    expect(getByTestId('raw').props.children).toBe('12');
    expect(getByTestId('value').props.children).toBe('12');
    expect(getByTestId('isValid').props.children).toBe('true');
  });

  it('uses the first value when param is a string array', () => {
    mockedUseLocalSearchParams.mockReturnValue({ id: ['5', '6'] });

    const { getByTestId } = render(<HookConsumer paramKey="id" />);

    expect(getByTestId('raw').props.children).toBe('5');
    expect(getByTestId('value').props.children).toBe('5');
    expect(getByTestId('isValid').props.children).toBe('true');
  });

  it('returns invalid for non-numeric values', () => {
    mockedUseLocalSearchParams.mockReturnValue({ id: 'abc' });

    const { getByTestId } = render(<HookConsumer paramKey="id" />);

    expect(getByTestId('raw').props.children).toBe('abc');
    expect(getByTestId('value').props.children).toBe('NaN');
    expect(getByTestId('isValid').props.children).toBe('false');
  });
});

