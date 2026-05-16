import { useNavigate } from "react-router-dom";
import { CustomerView } from "../../features/customer/CustomerView";
import { useAuthStore } from "../../stores/useAuthStore";
import { useAdminStore } from "../../stores/useAdminStore";
import { STYLES } from "../../constants/theme";

export default function MenuPreviewPage(){
  const navigate = useNavigate();
  const user = useAuthStore(s => s.user);
  const config = useAdminStore(s => s.config);
  const products = useAdminStore(s => s.products);
  const cats = useAdminStore(s => s.cats);
  const branches = useAdminStore(s => s.branches);
  const addOrder = useAdminStore(s => s.addOrder);

  return <>
    <style>{STYLES}</style>
    <CustomerView
      config={config}
      products={products}
      cats={cats}
      onBack={() => navigate("/admin/home")}
      onAddOrder={addOrder}
      branches={branches}
      banners={config.banners || []}
      businessType={user?.businessType || "restaurant"}
    />
  </>;
}
