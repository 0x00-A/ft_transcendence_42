import { Trophy, Ban } from "lucide-react";

const NoTournamentIcon = ({ size = 24, color = "#999999" }) => {
  return (
    <div className="relative inline-block">
      <Trophy size={size} color={color} />
      <Ban
        size={size}
        color={color}
        className="absolute top-0 left-0 opacity-50"
      />
    </div>
  );
};

export default NoTournamentIcon;
