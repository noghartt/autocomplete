import { render, cleanup } from '@testing-library/vue';
import { userEvent } from '@testing-library/user-event';
import { it, expect, beforeEach } from 'vitest';

import App from './App.vue';

beforeEach(() => {
  cleanup();
  fetch.resetMocks();
});

it('should render App with success', async () => {
  const screen = render(App);
  expect(screen.getByTestId('autocomplete-input')).toBeTruthy();
});

it('should render App and should type into the input', async () => {
  fetch.mockResponse(
    JSON.stringify({
      completions: [{ phrase: 'Pikachu', score: 52 }],
    }),
  );

  const screen = render(App);

  const el = screen.getByTestId('autocomplete-input');
  const input = el.querySelector('div[contenteditable]');

  expect(input).toBeTruthy();

  await userEvent.click(input!);
  await userEvent.keyboard('I pick you Pikachu');

  expect(screen.getByText('I pick you')).toBeTruthy();
  expect(screen.getAllByText('Pikachu')).toHaveLength(2);

  expect(fetch).toHaveBeenCalledTimes(7);
  const fetchCall = fetch.mock.calls[6][0];
  expect(fetchCall).toBe('https://bleeding.routine.co:8080/completion?query=Pikachu');

  const options = screen.getAllByRole('option');

  expect(options).toHaveLength(1);
});
