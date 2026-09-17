import { FORMAT_VERSION } from "tsheet-core";

// React と Vite は W-01 で導入する。それまではワークスペースの結線だけを確認する。
export const appInfo = { name: "Witree", formatVersion: FORMAT_VERSION } as const;
