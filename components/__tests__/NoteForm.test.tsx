import { act, fireEvent, render } from '@testing-library/react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { NoteForm } from '@/components/NoteForm';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: jest.fn(),
}));

// `components/ui/text` imports `@rn-primitives/slot` even though NoteForm uses `asChild=false`.
// The real `slot` package ships JSX in its distributed JS, which Jest may fail to parse in this environment.
jest.mock('@rn-primitives/slot', () => ({
  Text: () => null,
}));

const mockedUseSafeAreaInsets = useSafeAreaInsets as unknown as jest.Mock;

describe('components/NoteForm', () => {
  beforeEach(() => {
    mockedUseSafeAreaInsets.mockReturnValue({
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    });
  });

  it('calls onSave with trimmed title and content', async () => {
    const onSave = jest.fn().mockResolvedValue(undefined);

    const { getByPlaceholderText, getAllByRole } = render(
      <NoteForm onSave={onSave} submitLabel="Save" />
    );

    const titleInput = getByPlaceholderText('Title');
    const contentInput = getByPlaceholderText('Note content');

    fireEvent.changeText(titleInput, '  Hello  ');
    fireEvent.changeText(contentInput, '  World  ');

    // NoteForm renders a single Pressable button (role="button") via components/ui/button.
    const saveButton = getAllByRole('button')[0];
    await act(async () => {
      fireEvent.press(saveButton);
    });

    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenCalledWith('Hello', 'World');
  });

  it('does not call onSave when title is empty/whitespace', () => {
    const onSave = jest.fn().mockResolvedValue(undefined);

    const { getByPlaceholderText, getAllByRole } = render(
      <NoteForm onSave={onSave} submitLabel="Save" />
    );

    const titleInput = getByPlaceholderText('Title');
    const contentInput = getByPlaceholderText('Note content');

    fireEvent.changeText(titleInput, '   ');
    fireEvent.changeText(contentInput, 'Something');

    const saveButton = getAllByRole('button')[0];
    fireEvent.press(saveButton);

    expect(onSave).not.toHaveBeenCalled();
  });
});
