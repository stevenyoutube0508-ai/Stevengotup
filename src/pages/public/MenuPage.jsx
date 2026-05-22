import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { PublicMenu } from "../../features/customer/CustomerView";

export default function MenuPage() {
  const navigate = useNavigate();
  const { userId: pathUserId } = useParams();            // /menu/:userId
  const [searchParams] = useSearchParams();
  const userId      = pathUserId || searchParams.get("r") || null; // ?r= legacy
  const branchId    = searchParams.get("b") || null;               // ?b= opcional
  const initialMode = searchParams.get("mode") || null;            // ?mode=mesa|delivery

  return (
    <PublicMenu
      userId={userId}
      branchId={branchId}
      initialMode={initialMode}
      onBack={() => {
        if (window.history.length > 2) {
          window.history.back();
        }
        // si no hay historial (acceso directo por QR) simplemente no hacer nada
      }}
    />
  );
}
