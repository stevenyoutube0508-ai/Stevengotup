import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { PublicMenu } from "../../features/customer/CustomerView";

export default function MenuPage() {
  const navigate = useNavigate();
  const { userId: pathUserId } = useParams();            // /menu/:userId
  const [searchParams] = useSearchParams();
  const userId   = pathUserId || searchParams.get("r") || null; // ?r= legacy
  const branchId = searchParams.get("b") || null;               // ?b= opcional

  return (
    <PublicMenu
      userId={userId}
      branchId={branchId}
      onBack={() => navigate("/login")}
    />
  );
}
