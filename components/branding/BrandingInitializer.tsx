"use client";

import { useEffect, useRef } from "react";
import { useAppDispatch } from "@/lib/store/hooks";
import { setBranding, BrandConfiguration } from "@/lib/store/branding/brandingSlice";

interface BrandingInitializerProps {
  initialConfig: BrandConfiguration | null;
}

export default function BrandingInitializer({ initialConfig }: BrandingInitializerProps) {
  const dispatch = useAppDispatch();
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current && initialConfig) {
      dispatch(setBranding(initialConfig));
      initialized.current = true;
    }
  }, [dispatch, initialConfig]);

  return null;
}
