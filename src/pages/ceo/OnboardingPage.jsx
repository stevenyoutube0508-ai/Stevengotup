import { CEOOnboarding } from "../../features/ceo/CEOOnboarding";
import { useCEOStore } from "../../stores/useCEOStore";

export default function OnboardingPage(){
  const addRestaurant = useCEOStore(s => s.addRestaurant);
  return <CEOOnboarding onAdd={addRestaurant}/>;
}
