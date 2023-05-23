import { DragEventHandler } from "react";

export const stopProp: DragEventHandler<HTMLDivElement> = (e) => { e.preventDefault(); e.stopPropagation() }