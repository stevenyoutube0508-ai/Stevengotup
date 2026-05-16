export function pointInPoly(pt,poly){
  const x=pt.lng,y=pt.lat;let inside=false;
  for(let i=0,j=poly.length-1;i<poly.length;j=i++){
    const xi=poly[i].lng,yi=poly[i].lat,xj=poly[j].lng,yj=poly[j].lat;
    if(((yi>y)!==(yj>y))&&x<(xj-xi)*(y-yi)/(yj-yi)+xi)inside=!inside;
  }
  return inside;
}
