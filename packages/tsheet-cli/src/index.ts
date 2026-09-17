import { FORMAT_VERSION } from "tsheet-core";

/** `tsheet --version` に表示する文字列。 */
export function versionText(cliVersion: string): string {
  return `tsheet-cli ${cliVersion} (tsheet ${FORMAT_VERSION})`;
}
