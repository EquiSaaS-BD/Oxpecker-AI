import React from "react";

interface MessageMedicalIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  strokeWidth?: number;
}

/**
 * MessageMedicalIcon: Matches Font Awesome fa-thin fa-message-medical
 * A sleek speech bubble with a centered medical cross emblem.
 */
export function MessageMedicalIcon({
  size = 20,
  color = "rgb(116, 192, 252)",
  className = "",
  strokeWidth = 1.6,
  ...props
}: MessageMedicalIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* Speech bubble outline */}
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      {/* Centered medical cross */}
      <path d="M12 7v6" />
      <path d="M9 10h6" />
    </svg>
  );
}

export default MessageMedicalIcon;
