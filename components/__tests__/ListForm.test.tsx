import { act, fireEvent, render } from '@testing-library/react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ListForm } from '@/components/ListForm';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: jest.fn(),
}));

// `components/ui/text` imports `@rn-primitives/slot` which ships JSX in its
// distributed JS — Jest fails to parse it without this mock.
jest.mock('@rn-primitives/slot', () => ({
  Text: () => null,
}));

jest.mock('lucide-react-native', () => ({
  Trash2Icon: () => null,
}));

const mockedUseSafeAreaInsets = useSafeAreaInsets as unknown as jest.Mock;

describe('components/ListForm', () => {
  beforeEach(() => {
    mockedUseSafeAreaInsets.mockReturnValue({ top: 0, right: 0, bottom: 0, left: 0 });
  });

  it('calls onSave with trimmed title and current items', async () => {
    const onSave = jest.fn().mockResolvedValue(undefined);

    const { getByPlaceholderText, getByText } = render(
      <ListForm
        initialItems={[{ checked: false, text: 'buy milk' }]}
        onSave={onSave}
        submitLabel="Save"
      />,
    );

    fireEvent.changeText(getByPlaceholderText('Title'), '  My List  ');

    await act(async () => {
      fireEvent.press(getByText('Save'));
    });

    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenCalledWith('My List', [{ checked: false, text: 'buy milk' }]);
  });

  it('does not call onSave when title is empty or whitespace', () => {
    const onSave = jest.fn().mockResolvedValue(undefined);

    const { getByText } = render(<ListForm onSave={onSave} submitLabel="Save" />);

    fireEvent.press(getByText('Save'));

    expect(onSave).not.toHaveBeenCalled();
  });

  it('pressing Add appends a new empty item row', () => {
    const onSave = jest.fn();

    const { getByText, queryByPlaceholderText, getByPlaceholderText } = render(
      <ListForm onSave={onSave} />,
    );

    expect(queryByPlaceholderText('Item 1')).toBeNull();

    fireEvent.press(getByText('Add'));

    expect(getByPlaceholderText('Item 1')).toBeTruthy();
  });

  it('deleting an item removes it and preserves the remaining item', () => {
    const onSave = jest.fn();

    const { getByLabelText, queryByPlaceholderText, getByDisplayValue } = render(
      <ListForm
        initialItems={[
          { checked: false, text: 'first' },
          { checked: false, text: 'second' },
        ]}
        onSave={onSave}
      />,
    );

    expect(queryByPlaceholderText('Item 2')).toBeTruthy();

    fireEvent.press(getByLabelText('Delete item 1'));

    expect(queryByPlaceholderText('Item 2')).toBeNull();
    expect(getByDisplayValue('second')).toBeTruthy();
  });
});
