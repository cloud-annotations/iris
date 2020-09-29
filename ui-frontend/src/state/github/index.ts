import { atom, selector } from "recoil";

type Token = string | undefined;
type Page = number;
type Selection = number | undefined;

const selectedInstallation = atom<Selection>({
  key: "selectedInstallation",
  default: undefined,
});

export const tokenState = atom<Token>({
  key: "tokenState",
  default: undefined,
});

export const repoState = atom<Page>({
  key: "repoState",
  default: 1,
});

export const installationState = selector<Selection>({
  key: "installationState",
  get: ({ get }) => get(selectedInstallation),
  set: ({ set, reset }, newVal) => {
    set(selectedInstallation, newVal);
    reset(repoState);
  },
});
