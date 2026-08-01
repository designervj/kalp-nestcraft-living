"use client";
import React from "react";
import GetAllPages from "./GetAllPages";
import GetAllMenus from "../cms/menus/GetAllMenus";
import GetAllProducts from "@/lib/GetAllDetails/GetAllProducts";
import UpdateCurrentPage from "./UpdateCurrentPage";
import GetAllAttributes from "@/lib/GetAllDetails/GetAllAttributes";
import GetAllCategories from "@/lib/GetAllDetails/GetAllCategories";
import GetCart from "@/lib/GetAllDetails/GetCart";

const FetchAllData = () => {
  return (
    <>
      {/* get all pages */}
      <GetAllPages />

      {/* get all menus */}
      <GetAllMenus />

      {/* Commerce entities remain live and are never copied into CMS pages. */}
      <GetAllProducts />


      {/* get auth token from fast api */}
      {/* <GetAuthTokenFastApi /> */}

      {/* update current page */}
      <UpdateCurrentPage />

      {/* get all attributes */}
      <GetAllAttributes />

      {/* get all categories */}
      <GetAllCategories />

      {/* get cart */}
      <GetCart />

      {/* get all user */}
      {/* <GetUser user={user} /> */}
    </>
  );
};

export default FetchAllData;
