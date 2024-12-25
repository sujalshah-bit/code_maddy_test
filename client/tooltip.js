// First, create a widget provider class
export class FloatingNameWidget {
    constructor(name) {
        // Create the widget DOM element
        this.domNode = document.createElement('div');
        this.domNode.className = 'floating-name-widget';
        this.domNode.innerHTML = name;
        
        // Style the widget
        this.domNode.style.cssText = `
            position: absolute;
            background: #1e1e1e;
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            pointer-events: none;
            z-index: 1000;
            box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        `;
        
        this.timeout = null;
    }

    getId() {
        return 'floating.name.widget';
    }

    getDomNode() {
        return this.domNode;
    }

    getPosition() {
        return null; // Position will be set dynamically
    }
}

// Add this CSS to your stylesheet
const styles = `
.floating-name-widget {
    animation: fadeInOut 3s ease-in-out;
}

@keyframes fadeInOut {
    0% { opacity: 0; }
    10% { opacity: 1; }
    90% { opacity: 1; }
    100% { opacity: 0; }
}`;

// Initialize the widget functionality
export function initializeFloatingName(editor) {
    let widget = null;
    let timeout = null;

    // Add event listener for editor content changes
    editor.onDidChangeCursorSelection((e) => {
        console.log('sujal shah')
        // Clear any existing timeout
        if (timeout) {
            clearTimeout(timeout);
        }

        // Get current cursor position
        const position = editor.getPosition();
        
        // Remove existing widget if it exists
        if (widget) {
            editor.removeOverlayWidget(widget);
        }

        // Create and add new widget
        widget = new FloatingNameWidget('sujal');
        editor.addOverlayWidget(widget);

        // Position the widget above the cursor
        const coordinates = editor.getScrolledVisiblePosition(position);
        if (coordinates) {
            widget.domNode.style.top = `${coordinates.top - 30}px`;
            widget.domNode.style.left = `${coordinates.left}px`;
        }

        // Set timeout to remove widget after 3 seconds
        timeout = setTimeout(() => {
            if (widget) {
                editor.removeOverlayWidget(widget);
                widget = null;
            }
        }, 3000);
    });
}

// Usage
// Assuming you have your Monaco Editor instance:
// initializeFloatingName(editor);