"use client";


import { fetchMenusThunk } from "@/lib/store/menus/menusThunk";
import { AppDispatch, RootState } from "@/lib/store/store";
import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";

const GetAllMenus = () => {
      const dispatch = useDispatch<AppDispatch>();

    const isApi = useRef<boolean>(false);

    const { isFetchedMenus } = useSelector((state: RootState) => state.menus);


    // useEffect(() => {


    //     if (!isFetchedMenus && !isApi.current ) {
    //         console.log("Dispatching fetchAllHeadersThunk");
    //         isApi.current = true;
    //         dispatch(fetchMenusThunk());
    //     } else {
    //         isApi.current = false;
    //     }
    // }, [dispatch, isFetchedMenus]);
  return null;
};
export default GetAllMenus;