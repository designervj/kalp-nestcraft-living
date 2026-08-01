"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { AppDispatch, RootState } from "../store/store";
import { fetchAttributes } from "../store/attributes/attributesThunk";

export default function GetAllAttributes() {
  const { attributeLoading, hasAttributesFetched } = useSelector(
    (state: RootState) => state.adminAttributes,
  );

  const dispatch = useDispatch<AppDispatch>();

  const { user: user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    // if (!user) return;

    if (!hasAttributesFetched && !attributeLoading) {
      dispatch(fetchAttributes());
    }
  }, [user, hasAttributesFetched, attributeLoading]);

  return null;
}
