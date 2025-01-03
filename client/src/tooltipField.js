import { StateField, EditorView, Decoration, DecorationSet } from "@codemirror/state";
import { WidgetType } from "@codemirror/view";

// Tooltip widget
class TooltipWidget extends WidgetType {
    constructor(content) {
        super();
        this.content = content;
    }

    toDOM(view) {
        const div = document.createElement("div");
        div.textContent = this.content;
        div.style.background = "#333";
        div.style.color = "#fff";
        div.style.padding = "5px";
        div.style.borderRadius = "4px";
        div.style.fontSize = "12px";
        div.style.position = "absolute";
        div.style.zIndex = "1000";
        return div;
    }
}

// Tooltip field for CodeMirror
export function tooltipField(users = []) {
    return StateField.define({
        create() {
            return Decoration.none;
        },
        update(decorations, transaction) {
            let builder = new DecorationSet();
            for (const user of users) {
                // Mock logic for showing tooltips near the cursor
                const deco = Decoration.widget({
                    widget: new TooltipWidget(`${user.username} is editing`),
                    side: 1,
                }).range(user.cursorPosition);
                builder = builder.add(transaction.newDoc, [deco]);
            }
            return builder;
        },
        provide: (field) => EditorView.decorations.from(field),
    });
}
