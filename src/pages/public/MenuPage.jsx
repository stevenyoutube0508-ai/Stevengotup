import { useNavigate } from "react-router-dom";
import { PublicMenu } from "../../features/customer/CustomerView";

export default function MenuPage(){
  const navigate = useNavigate();
  return <PublicMenu onBack={() => navigate("/login")}/>;
}
