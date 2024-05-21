import Quill, { type QuillOptions } from 'quill';

const DEFAULT_OPTIONS: QuillOptions = {
  modules: {
    toolbar: false,
    keyboard: {
      bindings: {
        shift_enter: {
          key: 'Enter',
          shiftKey: true,
          handler: () => false,
        },
        enter: {
          key: 'Enter',
          handler: () => false,
        },
      },
    },
  },
};

type GetOrCreateQuillArgs = {
  container?: string;
  placeholder: string;
  config?: {
    disablePaste?: boolean;
  };
};

export const createQuillInstance = ({
  placeholder,
  container = '.editor--root',
  config = {},
}: GetOrCreateQuillArgs) => {
  const quill = new Quill(container, {
    ...DEFAULT_OPTIONS,
    placeholder,
  });

  if (config.disablePaste) {
    // TODO: Avoid the paste handler while not formatting the text
    quill.clipboard.onPaste = () => null;
  }

  return quill;
};
