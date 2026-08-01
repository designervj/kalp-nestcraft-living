"use client"

import { useAppDispatch } from "@/lib/store/hooks"
import { useEffect } from "react"
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store/store";
import { usePathname } from "next/navigation";
import { setCurrentPages } from "@/lib/store/pages/pagesSlice";

const UpdateCurrentPage = () => {

    const {allPages}=useSelector((state:RootState)=>state.pages)
    const pathname=usePathname();
    const slug=pathname.slice(1);
    const dispatch=useAppDispatch()
   useEffect(()=>{
if(allPages.length> 0 &&
   pathname==="/"){

  const data=allPages.find((page:any)=>page.slug==="home")
  // console.log("data--current page",data)
  if(data){
    dispatch(setCurrentPages(data))
  }
}
if(allPages.length> 0 && slug!=="/"){

  const data=allPages.find((page:any)=>page.slug===slug)
  // console.log("data--",data)
  if(data){
    dispatch(setCurrentPages(data))
  }
}
   },[allPages,slug, pathname])

    return null
}
export default UpdateCurrentPage
