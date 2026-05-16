import React from "react";
import { T, STYLES } from "../../constants/theme";
import { Btn } from "./Btn";

export class ErrorBoundary extends React.Component{
  constructor(props){
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error){
    return { hasError: true, error };
  }

  componentDidCatch(error, info){
    console.error("Route error:", error, info);
  }

  render(){
    if(this.state.hasError){
      return <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:T.bg,padding:24}}>
        <style>{STYLES}</style>
        <div style={{background:T.white,border:`1px solid ${T.border}`,borderRadius:20,padding:28,maxWidth:520,boxShadow:T.shMd,textAlign:"center"}}>
          <div style={{fontSize:48,marginBottom:12}}>⚠️</div>
          <h2 style={{fontSize:20,fontWeight:900,color:T.text,marginBottom:8}}>Algo falló en esta sección</h2>
          <p style={{fontSize:13,color:T.mid,lineHeight:1.6,marginBottom:18}}>La app sigue viva. Recarga la página o vuelve al inicio para continuar.</p>
          <Btn onClick={() => window.location.assign("/")}>Volver al inicio</Btn>
        </div>
      </div>;
    }
    return this.props.children;
  }
}
