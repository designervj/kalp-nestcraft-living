"use client";
import { useAppDispatch } from "@/lib/store/hooks";
import { RootState } from "@/lib/store/store";
import { fetchWebsiteDetailThunk } from "@/lib/store/websiteDetail/websiteDetailThunk";
import React, { useEffect, useRef } from "react";
import { useSelector } from "react-redux";

const GetAuthTokenFastApi = () => {
  const dispatch = useAppDispatch();
  const { isFetechedWebsiteDetail } = useSelector(
    (state: RootState) => state.websiteDetail,
  );

  const isApi = useRef<boolean>(false);
  useEffect(() => {
    if (!isFetechedWebsiteDetail && !isApi.current) {
      isApi.current = true;
      dispatch(fetchWebsiteDetailThunk());
    } else {
      isApi.current = false;
    }
  }, [isFetechedWebsiteDetail]);
  return null;
};

export default GetAuthTokenFastApi;
