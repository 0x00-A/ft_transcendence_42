import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface LogoProps {
  style: string;
}

function Logo({ style }: LogoProps) {
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= 1264);
  const navigate = useNavigate();


  useEffect(() => {
    const handleResize = () => {
      setIsLargeScreen(window.innerWidth > 1264);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <img
      onClick={() => {navigate('/');}}
      className={style}
      src={isLargeScreen ? "/logo/ft_pong.png" : "/logo/ft-pongLarge.png"}
      alt="logo"
    />
  );
}

export default Logo;
