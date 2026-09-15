"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../store/store";
import { setCredentials } from "../store/auth/authSlice";
import { getUserThunk } from "../store/auth/authThunks";
import type { RootState } from "../store/store";

export default function GetUser({ user }: { user: any }) {
  const dispatch = useDispatch<AppDispatch>();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  useEffect(() => {
    if (user) {
      dispatch(setCredentials({ user }));
      return;
    }

    if (!isAuthenticated) {
      dispatch(getUserThunk());
    }
  }, [dispatch, isAuthenticated, user]);

  return null;
}
