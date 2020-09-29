import { atom } from "recoil";

type Selection = number | undefined;

export const accountState = atom<Selection>({
  key: "selectedAccount",
  default: undefined,
});
