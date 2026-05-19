// Shim: redirect `import ... from "react"` to the global window.React (from UMD CDN).
declare const window: any;
const R: any = (typeof window !== "undefined" ? window.React : (globalThis as any).React);
export default R;
export const useState = R.useState;
export const useMemo = R.useMemo;
export const useEffect = R.useEffect;
export const useCallback = R.useCallback;
export const useRef = R.useRef;
export const useContext = R.useContext;
export const createContext = R.createContext;
export const Fragment = R.Fragment;
export const createElement = R.createElement;
