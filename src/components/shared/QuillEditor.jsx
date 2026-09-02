"use client";

// ===================================================================
// QuillEditor — thin client-only wrapper around react-quill-new.
//
// Why a wrapper: `next/dynamic` does not reliably forward refs, so the
// parent can't reach the Quill instance through a normal ref. Instead
// the parent passes `onEditorReady` and receives the raw Quill object
// once — which is what the custom toolbar buttons need in order to
// insert at the caret instead of blindly appending to the end.
//
// This file must only ever be reached through `dynamic(..., {ssr:false})`
// — Quill touches `document` at import time and will crash SSR.
// ===================================================================

import { useEffect, useRef } from "react";
import ReactQuill from "react-quill-new";

export default function QuillEditor({ onEditorReady, ...props }) {
    const innerRef = useRef(null);
    const notified = useRef(false);

    useEffect(() => {
        if (notified.current || !onEditorReady) return;

        // ReactQuill.getEditor() THROWS ("Accessing non-instantiated
        // editor") rather than returning undefined when the underlying
        // Quill instance isn't built yet — optional chaining is no
        // protection. An uncaught throw here would take down the whole
        // admin editor, so probe defensively and retry on the next frame
        // until it's ready.
        let frame = 0;
        const tryAttach = () => {
            if (notified.current) return;
            let editor = null;
            try {
                editor = innerRef.current?.getEditor?.() ?? null;
            } catch {
                editor = null;
            }
            if (editor) {
                notified.current = true;
                onEditorReady(editor);
            } else {
                frame = requestAnimationFrame(tryAttach);
            }
        };
        tryAttach();

        return () => { if (frame) cancelAnimationFrame(frame); };
    }, [onEditorReady]);

    return <ReactQuill ref={innerRef} {...props} />;
}
