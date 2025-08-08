export default function Logo({ src }) {
  return (
    <img
      src={src || "/images/gauabhayaranyam.png"}
      alt="logo"
      loading="lazy"
    />
  );
}
