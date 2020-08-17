import loadBlocks from './blocks';

export default (editor, opts = {}) => {
  const options = {
    ...{
      // default options

      // SVG block options
      svgBlock: {
        label: 'SVG',
        category: 'Basic',
        attributes: {
          class: 'fa fa-object-group'
        }
      },

      // editor extensions
      extensions: {},

      // Editor configurations
      config: {},

      // Pass the editor constructor. By default, the `window.metodDraw` will be called
      constructor: '',

      // Label used on the apply button
      labelApply: 'Apply',

      // Label used on the rasterize button
      labelClose: 'Cancel',

      // Id to use to create the svg editor command
      commandId: 'mdraw-svg-editor',

      // Icon used in the component toolbar
      toolbarIcon: `<svg viewBox="0 0 24 24">
                    <path d="M20.71 7.04c.39-.39.39-1.04 0-1.41l-2.34-2.34c-.37-.39-1.02-.39-1.41 0l-1.84 1.83 3.75 3.75M3 17.25V21h3.75L17.81 9.93l-3.75-3.75L3 17.25z">
                    </path>
                  </svg>`,

      // !By default, GrapesJS takes the modified svg, and uses it to update the target.
      // If you need some custom logic you can use this custom 'onApply' function
      // eg.
      // onApply: (svgEditor, svgModel) => {
      //   const dataUrl = imageEditor.toDataURL();
      //   editor.AssetManager.add({ src: dataUrl }); // Add it to Assets
      //   imageModel.set('src', dataUrl); // Update the image component
      // }
      onApply: 0,

      // The apply button (HTMLElement) will be passed as an argument to this function, once created.
      // This will allow you a higher customization.
      onApplyButton: () => {},
    },
    ...opts
  };

  const methodTemplate = ``;

  const methodEl = document.createElement('div');
  methodEl.style = "display:none;z-index:5;";
  methodEl.innerHTML = methodTemplate;

  //document.body.appendChild(methodEl);

  const {
    onApply,
    commandId
  } = options;
  const getConstructor = () => window.methodDraw;
  let constr = getConstructor();

  // Update image component toolbar
  const domc = editor.DomComponents;
  const typeSvg = domc.getType('svg').model;
  domc.addType('svg', {
    model: {
      initToolbar() {
        typeSvg.prototype.initToolbar.apply(this, arguments);
        const tb = this.get('toolbar');
        const tbExists = tb.some(item => item.command === commandId);

        if (!tbExists) {
          tb.unshift({
            command: commandId,
            label: options.toolbarIcon,
          });
          this.set('toolbar', tb);
        }
      }
    }
  })

  // Add the svg editor command
  editor.Commands.add(commandId, {
    run(ed, s, options = {}) {
      const {
        id
      } = this;

      if (!constr) {
        ed.log('methodDraw SVG editor not found', {
          level: 'error',
          ns: commandId,
        });
        return ed.stopCommand(id);
      }

      this.editor = ed;
      this.target = options.target || ed.getSelected();
      this.svgEditor = constr;
      document.getElementById('svg_editor').style.display = "block";
      document.getElementById('menu_bar').style.display = "block";
      document.getElementById('gjs-sm-svg').style.display = "block";
      document.querySelector('.gjs-blocks-cs').style.pointerEvents = "none";
      this.svgEditor.canvas.setSvgString(this.writeSvg()); //?Set the svg to the canvas
      ed.getModel().setEditing(1);
    },

    stop(ed) {
      document.getElementById('svg_editor').style.display = "none";
      document.getElementById('menu_bar').style.display = "none";
      document.getElementById('gjs-sm-svg').style.display = "none";
      document.querySelector('.gjs-blocks-cs').style.pointerEvents = "auto";
      this.svgEditor.canvas.clearSelection();
      ed.getModel().setEditing(0);
    },

    getEditorConfig() {
      const config = {
        ...options.config
      };
      return config;
    },

    writeSvg() {
      const style = '<style>' +
        this.editor.CodeManager.getCode(this.target, 'css', {
          cssc: this.editor.CssComposer
        }) + '</style>';
      const splitSvg = this.target.toHTML().split('>');
      let svgStream = '';
      for (let i = 0; i < splitSvg.length; i++) {
        if (i == 0)
          svgStream += splitSvg[i] + ">" + style;
        else if (i == splitSvg.length - 1)
          svgStream += splitSvg[i];
        else
          svgStream += splitSvg[i] + ">";
      }
      return svgStream
    },

    parseSvg(svg) {
      const svgTag = svg.split(/<svg/);
      const {
        svgEditor
      } = this;
      return `<svg viewBox="0 0 ${svgEditor.canvas.contentW} ${svgEditor.canvas.contentH}" ${svgTag[1]}`;
    },

    applyChanges() {
      const {
        svgEditor,
        target,
        editor
      } = this;

      if (onApply) {
        onApply(svgEditor, target);
      } else {
        let result = svgEditor.canvas.getSvgString();
        this.applyToTarget(this.parseSvg(result));
      }
      editor.stopCommand(commandId);
    },

    applyToTarget(result) {
      const coll = this.target.collection;
      const at = coll.indexOf(this.target);
      coll.remove(this.target);
      coll.add(result, {
        at
      });
    },
  });

  // Add blocks
  loadBlocks(editor, options);

  //On editor load
  editor.on('load', () => {
    const pn = editor.Panels;
    const $ = grapesjs.$;

    let openSm = pn.getButton('views', 'open-sm');
    openSm && openSm.set('active', 1);

    let methodSector = $('<div id="gjs-sm-svg" class="gjs-sm-sector no-select">' +
      '<div class="gjs-sm-title"><span class="icon-settings fa fa-diamond"></span> SVG</div>' +
      '<div class="gjs-sm-properties" style="display: none;"></div></div>');
    var methodProps = methodSector.find('.gjs-sm-properties');
    methodProps.append($('#tools_top')); //?append properties from method draw
    $('.gjs-sm-sectors').before(methodSector);
    methodSector.find('.gjs-sm-title').on('click', function () {
      let methodStyle = methodProps.get(0).style;
      var hidden = methodStyle.display == 'none';
      if (hidden) {
        methodStyle.display = 'block';
      } else {
        methodStyle.display = 'none';
      }
    });
    $('.gjs-pn-commands .gjs-pn-buttons').append($('#menu_bar'));

    const content = `
      <button class="svg-editor__apply-btn" style="
        position: absolute;
        bottom: 100%; left: 75%;
        margin: 10px;
        /*background-color: #622a6d;*/
        color: white;
        font-size: 1rem;
        border-radius: 3px;
        border: none;
        padding: 10px 20px;
        cursor: pointer;
        z-index: 100;
      ">
        ${options.labelApply}
      </botton>
      <button class="svg-editor__close-btn" style="
        position: absolute;
        bottom: 100%; left: 67%;
        margin: 10px;
        /*background-color: #622a6d;*/
        color: white;
        font-size: 1rem;
        border-radius: 3px;
        border: none;
        padding: 10px 20px;
        cursor: pointer;
        z-index: 100;
      ">
        ${options.labelClose}
      </botton>
    `

    $('#tools_bottom').append($(content));
    $('.svg-editor__apply-btn').on('click', e => editor.Commands.get(options.commandId).applyChanges());
    $('.svg-editor__close-btn').on('click', e => editor.stopCommand(options.commandId));
    $('.tools_flyout').get(0).style.top = "67%";
  });
};