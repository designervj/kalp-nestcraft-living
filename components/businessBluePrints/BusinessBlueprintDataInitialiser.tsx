"use client";

import { useEffect, useRef } from "react";
import { useAppDispatch } from "@/lib/store/hooks";
import {
  BusinessBlueprint,
  setBusinessBlueprint,
} from "@/lib/store/businessBlueprints/businessBlueprintSlice";

interface BusinessBlueprintDataInitialiserProps {
  businessBlueprint: BusinessBlueprint;
}

export default function BusinessBlueprintDataInitialiser({
  businessBlueprint,
}: BusinessBlueprintDataInitialiserProps) {
  const dispatch = useAppDispatch();
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current && businessBlueprint) {
      dispatch(setBusinessBlueprint(businessBlueprint));
      initialized.current = true;
    }
  }, [businessBlueprint]);

  return null;
}
