import logoSmall from "../../assets/picku-logo-small.png";
import logoFull from "../../assets/picku-logo.png";

export function LogoIcon({ size = 40 }) {
  return <img src={logoSmall} width={size} height={size} alt="picku.ai" style={{ display: "block", objectFit: "contain" }} />;
}

export function LogoFull({ height = 36 }) {
  return <img src={logoFull} height={height} alt="picku.ai" style={{ display: "block", objectFit: "contain" }} />;
}
