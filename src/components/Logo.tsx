import React from "react";

interface LogoProps {
  src?: string; // optional prop
}

export default function Logo({ src }: LogoProps) {
  return (
    <img
      src={src || "/images/gauabhayaranyam.png"}
      alt="logo"
      loading="lazy"
    />
  );
}
