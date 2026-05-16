import { useEffect, useState } from "react";

export function useLeaflet(){
  const [ready,setReady]=useState(!!(window.L?.map));
  useEffect(()=>{
    if(ready)return;
    if(window.L?.map){setReady(true);return;}
    // CSS
    if(!document.getElementById("lf-css")){
      const lk=document.createElement("link");
      lk.id="lf-css";lk.rel="stylesheet";
      lk.href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(lk);
    }
    if(document.getElementById("lf-js"))return;
    const s=document.createElement("script");
    s.id="lf-js";
    s.src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    s.onload=()=>setReady(true);
    document.head.appendChild(s);
  },[]);
  return ready;
}
