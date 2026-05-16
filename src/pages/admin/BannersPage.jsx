import { getVertical } from "../../constants/verticals";
import { SecBanners } from "../../features/admin/design/SecBanners";
import { useAuthStore } from "../../stores/useAuthStore";
import { useAdminStore } from "../../stores/useAdminStore";

export default function BannersPage(){
  const user = useAuthStore(s => s.user);
  const config = useAdminStore(s => s.config);
  const cats = useAdminStore(s => s.cats);
  const updateBannersAndPopup = useAdminStore(s => s.updateBannersAndPopup);
  const vertical = getVertical(user?.businessType || "restaurant");
  return <SecBanners config={config} vertical={vertical} cats={cats} onUpdate={updateBannersAndPopup}/>;
}
