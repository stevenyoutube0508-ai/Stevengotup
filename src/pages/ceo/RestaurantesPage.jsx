import { CEORestaurantes } from "../../features/ceo/CEORestaurantes";
import { useCEOStore } from "../../stores/useCEOStore";
import { useAdminStore } from "../../stores/useAdminStore";

export default function RestaurantesPage(){
  const restaurants    = useCEOStore(s => s.restaurants);
  const updateRestaurant = useCEOStore(s => s.updateRestaurant);
  const showToast      = useAdminStore(s => s.showToast);
  return <CEORestaurantes restaurants={restaurants} onUpdate={updateRestaurant} showToast={showToast}/>;
}
