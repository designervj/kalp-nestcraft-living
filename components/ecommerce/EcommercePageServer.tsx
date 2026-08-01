import React from "react";
import { AnnotatorPlugin } from "../annotationPlugin/AnnotatorPlugin";
import GetAllPages from "../pages/GetAllPages";
import DynamicRenderer from "./DynamicRenderer";
import ecommerceLocalData from "@/data/ecommerce/ecommerce.json";

interface EcommercePageServerProps {
  data: any;
  user?: any;
}

const EcommercePageServer = ({ data, user }: EcommercePageServerProps) => {
  // Use the API data if available, otherwise fallback to local JSON
  const pageData = data || ecommerceLocalData;
  const content = Array.isArray(pageData?.content) ? pageData.content : [];

  return (
    <>

      <GetAllPages />

      <div data-annotate-id="ecommerce-page-root" className="bg-background text-foreground">
        <DynamicRenderer content={content} />
      </div>
    </>
  );
};

export default EcommercePageServer;
