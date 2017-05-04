const svgHeader = `xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 100 125" x="0px" y="0px"`

const LeftIcon = `
  <div class='svgOuter'>
  <svg ${svgHeader} class='icon svgInner' preserveAspectRatio="xMinYMin meet">
  <g>
    <path d="M70.59,95.41a2,2,0,0,0,2.83-2.83L30.83,50,73.41,7.41a2,2,0,0,0-2.83-2.83l-44,44a2,2,0,0,0,0,2.83Z"/></g>
  </svg>
  </div>
  `

const RightIcon = `
  <div class='svgOuter'>
    <svg ${svgHeader} class='icon svgInner'>
      <g>
        <path           d="M26.59,95.41a2,2,0,0,0,2.83,0l44-44a2,2,0,0,0,0-2.83l-44-44a2,2,0,0,0-2.83,2.83L69.17,50,26.59,92.59A2,2,0,0,0,26.59,95.41Z"/>
      </g>
    </svg>
  </div>
  `

export { LeftIcon, RightIcon }
