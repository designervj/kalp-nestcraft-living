import { connectMasterDB, connectTenantDB } from "../lib/db";

export const getUserModel = async () => {
  const db = await connectMasterDB();
  return db.collection("users");
};

export const getTenantsCollection = async () => {
  const db = await connectMasterDB();
  return db.collection("tenants");
};

export const getCategoryModel = async () => {
  const db = await connectTenantDB();
  return db.collection("categories");
};

export const getAttributeSetModel = async () => {
  const db = await connectTenantDB();
  return db.collection("attribute_sets");
};

export const getProductModel = async () => {
  const db = await connectTenantDB();
  return db.collection("products");
};

export const getVariantModel = async () => {
  const db = await connectTenantDB();
  return db.collection("variants");
};

export const getOrderModel = async () => {
  const db = await connectTenantDB();
  return db.collection("orders");
};

export const getPageModel = async () => {
  const db = await connectTenantDB();
  return db.collection("site_pages");
};

export const getCartModel = async () => {
  const db = await connectTenantDB();
  return db.collection("carts");
};

export const getInquiryModel = async () => {
  const db = await connectTenantDB();
  return db.collection("inquiries");
};
