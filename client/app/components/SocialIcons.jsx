import React from "react";

// ✅ UPDATED: Colored version, balanced to match other icons.
export const WhatsAppIcon = ({ size = 22, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    // ✅ CHANGED: viewBox is adjusted to make the icon appear larger
    viewBox="4 4 24 24"
    width={size}
    height={size}
    className={className}
    aria-hidden="true"
  >
    <path
      fill="#25D366"
      d="M16.001 3.2C9.373 3.2 4 8.573 4 15.2c0 2.61.773 5.037 2.118 7.056L4 28.8l6.726-2.09a11.965 11.965 0 0 0 5.275 1.194c6.627 0 12-5.373 12-12s-5.373-12-12-12Z"
    />
    <path
      fill="#fff"
      d="M12.637 9.734c-.33-.734-.677-.75-.992-.75h-.846c-.29 0-.76.109-1.157.546-.398.438-1.517 1.48-1.517 3.613 0 2.133 1.552 4.195 1.768 4.484.215.29 3.058 4.855 7.551 6.609 3.729 1.47 4.487 1.18 5.296 1.11.808-.07 2.603-1.062 2.97-2.088.367-1.025.367-1.906.258-2.088-.109-.183-.398-.29-.83-.508-.432-.219-2.603-1.287-3.004-1.431-.398-.146-.69-.218-.979.218-.29.438-1.124 1.432-1.379 1.721-.255.29-.508.328-.94.109-.432-.218-1.826-.672-3.48-2.144-1.287-1.147-2.156-2.563-2.411-3-.255-.437-.027-.672.191-.89.197-.197.437-.51.655-.764.218-.255.29-.437.437-.729.146-.292.073-.547-.037-.765-.109-.218-.96-2.389-1.348-3.271Z"
    />
  </svg>
);

// ✅ UPDATED: Colored version from your original file.
export const FacebookIcon = ({ size = 18, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width={size}
    height={size}
    className={className}
    aria-hidden="true"
  >
    <path
      fill="#1877F2"
      d="M24 12.073C24 5.404 18.627 0 12 0S0 5.404 0 12.073c0 5.996 4.388 10.969 10.125 11.854v-8.385H7.078V12.07h3.047V9.412c0-3.019 1.791-4.688 4.533-4.688 1.312 0 2.686.235 2.686.235v2.953h-1.513c-1.494 0-1.953.931-1.953 1.887v2.271h3.328l-.532 3.472h-2.796v8.385C19.612 23.042 24 18.07 24 12.073z"
    />
    <path
      fill="#fff"
      d="M16.671 15.543l.532-3.472h-3.328v-2.271c0-.956.459-1.887 1.953-1.887h1.513V5.96s-1.374-.235-2.686-.235c-2.742 0-4.533 1.669-4.533 4.688v2.658H7.078v3.472h3.047v8.385a12.05 12.05 0 0 0 3.75 0v-8.385h2.796z"
    />
  </svg>
);

// ✅ UPDATED: Size balanced with viewBox, uses currentColor to adapt to light/dark mode.
export const TwitterIcon = ({ size = 15, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 28 28"
    width={size}
    height={size}
    className={className}
    aria-hidden="true"
  >
    <path
      fill="currentColor"
      d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932L18.901 1.153zM17.61 20.644h2.039L6.486 3.24H4.298L17.61 20.644z"
    />
  </svg>
);

// ✅ UPDATED: Colored version from your original file.
export const TelegramIcon = ({ size = 18, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 240 240"
    width={size}
    height={size}
    className={className}
    aria-hidden="true"
  >
    <circle cx="120" cy="120" r="120" fill="#0088cc" />
    <path
      fill="#fff"
      d="M179.7 72.3l-22.5 106.3c-1.7 7.6-6.2 9.5-12.5 5.9l-34.5-25.4-16.6 16c-1.8 1.8-3.2 3.2-6.5 3.2l2.3-33.1 60.2-54.4c2.6-2.3-.6-3.7-4-1.4l-74.5 47-32-10c-7-2.2-7.2-7-1.5-9.2l125.2-48.2c5.8-2.1 10.8 1.3 9 9.1z"
    />
  </svg>
);


// --- Other Icons (Unchanged, using currentColor for flexibility) ---

export const InstagramIcon = ({ size = 18, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width={size}
    height={size}
    className={className}
    aria-hidden="true"
  >
    <path
      fill="currentColor"
      d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.85s-.012 3.584-.07 4.85c-.148 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07s-3.584-.012-4.85-.07c-3.252-.148-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.85s.012-3.584.07-4.85C2.25 3.854 3.779 2.31 7.031 2.163 8.297 2.105 8.677 2.093 12 2.093m0-2.093c-3.264 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948s.014 3.667.072 4.947c.2 4.358 2.618 6.78 6.98 6.98 1.281.059 1.689.073 4.948.073s3.667-.014 4.947-.072c4.358-.2 6.78-2.618 6.98-6.98.059-1.281.073-1.689.073-4.948s-.014-3.667-.072-4.947c-.2-4.358-2.618-6.78-6.98-6.98C15.667.014 15.264 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88z"
    />
  </svg>
);

export const LinkedInIcon = ({ size = 18, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width={size}
    height={size}
    className={className}
    aria-hidden="true"
  >
    <path
      fill="#0A66C2"
      d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
    />
  </svg>
);

export const MailIcon = ({ size = 18, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width={size}
    height={size}
    className={className}
    aria-hidden="true"
  >
    <path
      fill="#EA4335"
      d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-.904.732-1.636 1.636-1.636h.819L12 13.09l9.545-9.269h.819A1.636 1.636 0 0 1 24 5.457z"
    />
  </svg>
);

export const CopyIcon = ({ size = 18, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width={size}
    height={size}
    className={className}
    aria-hidden="true"
  >
    <path
      fill="currentColor"
      d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"
    />
  </svg>
);