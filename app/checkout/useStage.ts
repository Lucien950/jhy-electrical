import { useState } from "react";
import { Stages, validateP0FormData, validateP1FormData } from "./stages";
//types
import { FormCustomer } from "types/customer";
//analytics
import { logEvent } from "firebase/analytics";
import { analytics } from "util/firebase/analytics";

// STAGE TECHNOLOGY
export const useStage = (initialStage: Stages, customerInfo: FormCustomer) => {
  const [stage, setStage] = useState(initialStage)
  const [p0DataValid, setP0DataValid] = useState(validateP0FormData(customerInfo.fullName, customerInfo.address))
  const [p1DataValid, setP1DataValid] = useState(validateP1FormData(customerInfo.paymentSource || null, null, null))
  const goToStage = (s: Stages) => {
    if (s == Stages.P1 && !p0DataValid) throw new Error("Cannot go to that stage. Please implement better guards.")
    if (s == Stages.P2 && !p1DataValid) throw new Error("Cannot go to that stage. Please implement better guards.")
    logEvent(analytics(), "checkout_progress", { checkout_step: s })
    setStage(s)
  }

  return { stage, goToStage, p0DataValid, p1DataValid, setP0DataValid, setP1DataValid }
}
