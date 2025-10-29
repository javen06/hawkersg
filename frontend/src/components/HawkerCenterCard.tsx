import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useData } from "../contexts/DataContext";

type HawkerCenterLike = {
  id: number | string;
  name: string;
  address?: string;
  image?: string;
  img?: string;
  description?: string;
  desc?: string;
  stallCount?: number;
  stalls?: number;
  rating?: number;
};

export default function HawkerCenterCard({
  hawker,
  variant = "grid", // "carousel" or "grid"
}: {
  hawker: HawkerCenterLike;
  variant?: "carousel" | "grid";
}) {
  const { user } = useAuth();
  const { favorites, addToFavorites, removeFromFavorites } = useData();
  const isFavorited = favorites.includes(hawker.id as any);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user || user.user_type !== "consumer") return;
    if (isFavorited) removeFromFavorites(hawker.id as any);
    else addToFavorites(hawker.id as any);
  };

  const displayImage = hawker.image ?? hawker.img ?? "/placeholder.jpg";
  const displayDesc = hawker.description ?? hawker.desc ?? "";
  const displayStalls = hawker.stallCount ?? hawker.stalls ?? 0;
  const displayRating = hawker.rating ?? 0;

  const imageHeight = variant === "carousel" ? "h-56" : "h-64";
  const showDescription = variant === "grid";

  return (
    <Link
      to={`/hawker/${hawker.id}`}
      className="bg-white rounded-xl shadow hover:shadow-lg overflow-hidden relative block transition-shadow duration-300"
    >

      {/* Rating */}
      

      <img src={displayImage} alt={hawker.name} className={`${imageHeight} w-full object-cover`} />

      <div className="p-4">
        <h3 className="font-semibold text-lg">{hawker.name}</h3>
        {hawker.address && <p className="text-sm text-gray-600">{hawker.address}</p>}
        {showDescription && <p className="text-sm text-gray-500 mt-2 line-clamp-2">{displayDesc}</p>}
        <div className="flex justify-between items-center mt-3 text-sm">
          <span>{displayStalls} stalls</span>
          <span className="text-green-600">● Open daily</span>
        </div>
      </div>
    </Link>
  );
}