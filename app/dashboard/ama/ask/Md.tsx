import React, { useState, useRef } from "react";
import Editor from "react-markdown-editor-lite";
import "react-markdown-editor-lite/lib/index.css";
import { marked } from "marked";

interface Props {
  onChange: (value: string) => void;
}

const MdEditorComponent: React.FC<Props> = ({ onChange }) => {
  const mdEditor = useRef(null);
  const [value, setValue] = useState("");

  const handleEditorChange = ({ text }: { text: string }) => {
    setValue(text);
    onChange(text);
  };

  return (
    <Editor
      ref={mdEditor}
      value={value}
      onChange={handleEditorChange}
      renderHTML={(text) => marked(text)}
      className="border border-gray-600 rounded-lg bg-inherit text-white"
      style={{ height: "350px" }}
      placeholder="Write something in Markdown..."
      config={{
        view: {
          menu: true,
          md: true,
          html: true,
        },
        canView: {
          menu: true,
          md: true,
          html: true,
          fullScreen: true,
          hideMenu: false,
        },
        markdownClass: "prose prose-invert",
        imageUrl: "",
        shortcuts: true,
      }}
    />
  );
};

export default MdEditorComponent;
