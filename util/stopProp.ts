import { BaseSyntheticEvent } from "react";

export const stopProp = (e: BaseSyntheticEvent) => { e.preventDefault(); e.stopPropagation(); };
