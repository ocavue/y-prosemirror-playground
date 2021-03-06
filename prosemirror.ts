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
        ySyncPlugin(type),
        yCursorPlugin(provider.awareness),
        yUndoPlugin(),
        keymap({
          "Mod-z": undo,
          "Mod-y": redo,
          "Mod-Shift-z": redo,
        }),
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
