import { FC } from "react";

interface GlitchTextProps {
  children: string;
  speed?: number;
  enableShadows?: boolean;
  enableOnHover?: boolean;
  className?: string;
}

const GlitchText: FC<GlitchTextProps> = ({
  children,
  speed = 0.5,
  enableShadows = true,
  enableOnHover = false,
  className = "",
}) => {
  const duration = speed * 2;

  return (
    <>
      <style jsx>{`
        @keyframes glitch1 {
          0%,
          100% {
            clip-path: inset(40% 0 61% 0);
            transform: translate(0px, 0px);
          }
          20% {
            clip-path: inset(92% 0 1% 0);
            transform: translate(-2px, 0px);
          }
          40% {
            clip-path: inset(43% 0 1% 0);
            transform: translate(-2px, 0px);
          }
          60% {
            clip-path: inset(25% 0 58% 0);
            transform: translate(2px, 0px);
          }
          80% {
            clip-path: inset(54% 0 7% 0);
            transform: translate(2px, 0px);
          }
        }

        @keyframes glitch2 {
          0%,
          100% {
            clip-path: inset(25% 0 58% 0);
            transform: translate(0px, 0px);
          }
          20% {
            clip-path: inset(6% 0 78% 0);
            transform: translate(2px, 0px);
          }
          40% {
            clip-path: inset(84% 0 7% 0);
            transform: translate(2px, 0px);
          }
          60% {
            clip-path: inset(40% 0 61% 0);
            transform: translate(-2px, 0px);
          }
          80% {
            clip-path: inset(23% 0 27% 0);
            transform: translate(-2px, 0px);
          }
        }

        .glitch-container {
          position: relative;
          display: inline-block;
          cursor: pointer;
          user-select: none;
        }

        .glitch-container::before {
          content: "${children}";
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          color: #ff0000;
          z-index: -1;
          animation: glitch1 ${duration}s infinite linear alternate-reverse;
          clip-path: inset(40% 0 60% 0);
          text-shadow: ${enableShadows ? "-2px 0 #ff0000" : "none"};
          opacity: ${enableOnHover ? 0 : 1};
        }

        .glitch-container::after {
          content: "${children}";
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          color: #00ffff;
          z-index: -2;
          animation: glitch2 ${duration * 1.5}s infinite linear
            alternate-reverse;
          clip-path: inset(0% 0 40% 0);
          text-shadow: ${enableShadows ? "2px 0 #00ffff" : "none"};
          opacity: ${enableOnHover ? 0 : 1};
        }

        ${enableOnHover
          ? `
          .glitch-container:hover::before {
            opacity: 1;
          }
          
          .glitch-container:hover::after {
            opacity: 1;
          }
        `
          : ""}
      `}</style>

      <span className={`glitch-container ${className}`}>{children}</span>
    </>
  );
};

export default GlitchText;
