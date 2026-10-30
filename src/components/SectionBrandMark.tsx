
/**
 * @file src/components/SectionBrandMark.tsx
 * Vivah Sambandh — red and gold ribbon V brand mark.
 */

interface SectionBrandMarkProps {
  className?: string
  size?: string
}

export default function SectionBrandMark({
  className = '',
  size = 'h-10 w-12',
}: SectionBrandMarkProps) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center ${className}`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 100 80"
        className={size}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient
            id="vs-ribbon-red"
            x1="17"
            y1="8"
            x2="48"
            y2="66"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#A41631" />
            <stop offset=".32" stopColor="#C71E3D" />
            <stop offset=".66" stopColor="#9A102D" />
            <stop offset="1" stopColor="#640A20" />
          </linearGradient>

          <linearGradient
            id="vs-ribbon-red-shadow"
            x1="12"
            y1="12"
            x2="45"
            y2="61"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#6B0B21" />
            <stop offset=".5" stopColor="#8D102A" />
            <stop offset="1" stopColor="#48091A" />
          </linearGradient>

          <linearGradient
            id="vs-ribbon-gold"
            x1="49"
            y1="12"
            x2="88"
            y2="61"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#F6DFA5" />
            <stop offset=".3" stopColor="#DDB765" />
            <stop offset=".65" stopColor="#B48539" />
            <stop offset="1" stopColor="#E9C982" />
          </linearGradient>
        </defs>

        {/* Original red ribbon — unchanged */}
        <path
          d="
            M 5 10
            C 17 8, 27 13, 34 25
            C 39 34, 43 44, 49 51
            C 54 58, 61 62, 70 63
            C 57 66, 44 60, 36 50
            L 20 28
            C 14 19, 9 13, 5 10
            Z
          "
          fill="url(#vs-ribbon-red-shadow)"
        />

        {/* Original main red ribbon — unchanged */}
        <path
          d="
            M 13 10
            C 25 10, 34 16, 40 27
            C 44 35, 48 43, 53 49
            C 59 57, 66 61, 77 63
            C 64 66, 50 60, 41 49
            L 26 28
            C 21 20, 17 14, 13 10
            Z
          "
          fill="url(#vs-ribbon-red)"
        />

        





{/* Additional gold ribbon — thick, smooth upper-right curve */}
<path
  d="
    M 91 5
    C 81 7, 76 18, 71 31
    C 66 44, 61 54, 54 60
    C 61 56, 67 48, 72 36
    C 78 22, 83 10, 91 9
    Z
  "
  fill="url(#vs-ribbon-gold)"
/>







        {/* Original gold ribbon — unchanged */}
        <path
          transform="translate(10 0)"
          d="
            M 28 10
            C 37 10, 44 16, 49 25
            C 54 35, 57 45, 62 52
            C 65 57, 71 61, 78 63
            C 67 63, 57 58, 51 50
            C 44 41, 39 29, 33 19
            C 31 15, 29 12, 28 10
            Z
          "
          fill="url(#vs-ribbon-gold)"
        />
      </svg>
    </span>
  )
}
