import { FiHeart } from "react-icons/fi";

export default function LikeButton({
  liked = false,
  pending = false,
  onClick,
  className,
}) {
  return (
    <button
      type="button"
      className={className}
      aria-pressed={liked}
      aria-label={liked ? "Unlike" : "Like"}
      disabled={pending}
      onClick={onClick}
    >
      <FiHeart aria-hidden="true" />
    </button>
  );
}
