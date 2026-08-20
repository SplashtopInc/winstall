import { FiThumbsUp } from "react-icons/fi";

import { formatCount } from "../utils/engagementStats";

export default function LikeButton({
  liked = false,
  likeCount = 0,
  pending = false,
  onClick,
  className,
}) {
  const label = formatCount(likeCount) ?? "0";

  return (
    <button
      type="button"
      className={className}
      aria-pressed={liked}
      aria-label={liked ? "Unlike" : "Like"}
      disabled={pending}
      onClick={onClick}
    >
      <FiThumbsUp aria-hidden="true" />
      {label}
    </button>
  );
}
