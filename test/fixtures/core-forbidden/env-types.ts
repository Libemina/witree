// DOM / Node の型は tsheet-core に含めないため、以下はすべて型エラーになる。
export const a = document.title;
export const b = process.env;
export const c = setTimeout(() => undefined, 0);
export const d = crypto.randomUUID();
