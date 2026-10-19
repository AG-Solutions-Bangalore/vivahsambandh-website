declare global {
  namespace React {
    namespace JSX {
      interface IntrinsicElements {
        marquee: React.DetailedHTMLProps<
          React.HTMLAttributes<HTMLElement> & {
            behavior?: 'scroll' | 'slide' | 'alternate'
            direction?: 'left' | 'right' | 'up' | 'down'
            scrollamount?: number | string
            scrolldelay?: number | string
            truespeed?: boolean
            loop?: number | string
            hspace?: number | string
            vspace?: number | string
            onMouseEnter?: React.MouseEventHandler<HTMLElement>
            onMouseLeave?: React.MouseEventHandler<HTMLElement>
          },
          HTMLElement
        >
      }
    }
  }
}

export {}
