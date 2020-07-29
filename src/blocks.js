export default (editor, opts = {}) => {
  const bm = editor.BlockManager;
  const svgAttrs =
    'xmlns="http://www.w3.org/2000/svg" width="100" viewBox="0 0 24 24"';

  opts.svgBlock &&
    bm.add('svg', {
      label: opts.svgBlock.label || 'SVG',
      category: opts.svgBlock.category || 'Basic',
      attributes: opts.svgBlock.attributes || {
        class: 'fa fa-object-group'
      },
      content: `<svg ${svgAttrs}>
        <g>
          <title>background</title>
          <rect fill="none" id="canvas_background" height="602" width="802" y="-1" x="-1"/>
        </g>
        <g>
          <title>Layer 1</title>
          <path id="svg_1" style="fill: rgba(0,0,0,0.15);" d="m8.5,11.20217l2.5,3l3.5,-4.5l4.5,6l-14,0m16,1l0,-14a2,2 0 0 0 -2,-2l-14,0c-1.1,0 -2,0.9 -2,2l0,14c0,1.1 0.9,2 2,2l14,0c1.1,0 2,-0.9 2,-2z"/>
          <text transform="matrix(1,0,0,1,0,0) " font-weight="bold" xml:space="preserve" text-anchor="start" font-family="Helvetica, Arial, sans-serif" font-size="5" id="svg_4" y="23.04311" x="6.72053" fill-opacity="null" stroke-opacity="null" stroke-width="0" stroke="null" fill="rgba(0,0,0,0.15)">SVG</text>
        </g>
      </svg>`
    });
}