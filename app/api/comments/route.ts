import { NextRequest } from "next/server";

import { proxyRequest } from "@/lib/apiProxy";


const TARGET = "publishing/page-reviews/comments";


export async function GET(request: NextRequest) {
  return proxyRequest(request, TARGET);
}


export async function POST(request: NextRequest) {
  return proxyRequest(request, TARGET);
}


export async function PUT(request: NextRequest) {
  return proxyRequest(request, TARGET);
}


export async function DELETE(request: NextRequest) {
  return proxyRequest(request, TARGET);
}
