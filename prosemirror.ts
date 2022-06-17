import * as Y from "yjs";
import { WebrtcProvider } from "y-webrtc";
import {
  ySyncPlugin,
  yCursorPlugin,
  yUndoPlugin,
  undo,
  redo,
} from "y-prosemirror";
import { EditorState, Plugin } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { schema } from "./schema";
import { exampleSetup } from "prosemirror-example-setup";
import { keymap } from "prosemirror-keymap";
import { PluginKey } from "prosemirror-state";

const myPluginKey = new PluginKey<MyPluginState>("myPlugin");

type MyPluginState = {
  debugCounter: number;
  cursorChanged: boolean;
  cursorPosition: number;
};

function createMyPlugin(schema) {
  return new Plugin<MyPluginState>({
    key: myPluginKey,
    state: {
      init: () => {
        console.log("[my-plugin] init");
        return {
          debugCounter: 0,
          cursorPosition: 0,
          cursorChanged: false,
        };
      },
      apply: (tr, oldMyPluginState) => {
        let { debugCounter, cursorPosition } = oldMyPluginState;
        debugCounter += 1;
        const cursorChanged = tr.selection.from !== cursorPosition;
        console.log(`[my-plugin] apply`, { debugCounter, cursorChanged });
        return {
          debugCounter,
          cursorChanged,
          cursorPosition: tr.selection.from,
        };
      },
    },
    view: () => {
      return {
        update(view, prevState) {
          const wrapper = document.getElementById("id_cursor_changed");
          const myPluginState = myPluginKey.getState(view.state);
          if (wrapper && myPluginState) {
            wrapper.textContent = String(myPluginState.cursorChanged);
          }
          console.log("[my-plugin] update");
        },
      };
    },
  });
}

window.addEventListener("load", () => {
  const ydoc = new Y.Doc();
  const provider = new WebrtcProvider("prosemirror-debug", ydoc);
  const type = ydoc.getXmlFragment("prosemirror");

  const editor = document.createElement("div");
  editor.setAttribute("id", "editor");
  const editorContainer = document.createElement("div");
  editorContainer.insertBefore(editor, null);
  const prosemirrorView = new EditorView(editor, {
    state: EditorState.create({
      schema,
      plugins: [
        createMyPlugin(schema),
        ySyncPlugin(type),
        // yCursorPlugin(provider.awareness),
        // yUndoPlugin(),
        // keymap({
        //   "Mod-z": undo,
        //   "Mod-y": redo,
        //   "Mod-Shift-z": redo,
        // }),
      ].concat(exampleSetup({ schema })),
    }),
  });
  document.body.insertBefore(editorContainer, null);

  const connectBtn = document.getElementById("y-connect-btn");
  if (connectBtn) {
    connectBtn.addEventListener("click", () => {
      if (provider.shouldConnect) {
        provider.disconnect();
        connectBtn.textContent = "Connect";
      } else {
        provider.connect();
        connectBtn.textContent = "Disconnect";
      }
    });
  }

  // @ts-ignore
  window.example = { provider, ydoc, type, prosemirrorView };
});
