import React from "react"
import { createRoot } from "react-dom/client"
import Glass from "./GlassIcon"
const root = createRoot(document.getElementById("root")!)
;(window as any).show = (cfg: any) => {
  root.render(<Glass key={cfg.key} style={{ width: cfg.w || 512, height: cfg.h || 512 }} {...cfg.props} />)
}
