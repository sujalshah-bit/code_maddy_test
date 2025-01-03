import {  ViewPlugin, Decoration } from '@codemirror/view';

const tooltipField = (getUsers) => {
  return ViewPlugin.fromClass(class {
    decorations;

    constructor(view) {
      this.decorations = this.createDecorations(view);
    }

    update(update) {
      if (update.selectionSet || update.docChanged) {
        this.decorations = this.createDecorations(update.view);
      }
    }

    createDecorations(view) {
      const users = getUsers();
      if (users.length === 0) return Decoration.none;

      const pos = view.state.selection.main.head;
      const widget = document.createElement('div');
      widget.className = 'cm-tooltip-cursor';
      widget.style.cssText = `
        position: absolute;
        padding: 2px 7px;
        background: #1a1b26;
        color: #a9b1d6;
        border: 1px solid #363b54;
        border-radius: 4px;
        font-size: 14px;
        pointer-events: none;
        z-index: 100;
      `;
      widget.textContent = users.map(user => `${user.username} is here`).join('\n');

      return Decoration.widget({
        widget: new class {
          toDOM() { return widget; }
        },
        side: 1
      }).range(pos);
    }
  }, {
    decorations: v => v.decorations
  });
}

export { tooltipField };