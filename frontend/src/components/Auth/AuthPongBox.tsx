// Styles
import css from "./AuthPongBox.module.css";
import { LOGO } from "@/config/constants";
import { Github } from "lucide-react";

const AuthPongBox = ({ isLogin }: { isLogin: boolean }) => {
  return (
    <div className={`${css.authPongBox} ${!isLogin ? css.switchPongBox : ""}`}>
      {/* <div className="flex flex-col items-center"> */}
      <div className={css.logoHolder}>
        <img src={LOGO} alt="" />
      </div>
      <div className={css.pong}>
        <div></div>
        <div></div>
        <div></div>
      </div>
      {/* </div> */}
      <footer className="w-full py-6 px-4 mb-10">
        <div className="w-full mx-auto flex items-center justify-center space-x-2 text-[#f8f3e3]">
          {/* <span>Want to contribute?</span> */}
          <a
            href="https://github.com/0x00-A/ft_transcendence"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 text-[#445c85] hover:text-blue-800 transition-colors"
          >
            <Github size={20} />
            <span>Check out the code on GitHub</span>
          </a>
        </div>
      </footer>
    </div>
  );
};

export default AuthPongBox;
