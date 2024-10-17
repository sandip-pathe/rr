import React from "react";
import Editor from "react-markdown-editor-lite";
import "react-markdown-editor-lite/lib/index.css";
import { marked } from "marked"; // Use marked to parse markdown to HTML

const MdEditorComponent = () => {
  const mdEditor = React.useRef(null);
  const [value, setValue] = React.useState("### Welcome to the AMA Editor");

  // Handle changes in the editor
  const handleEditorChange = ({ text }: any) => {
    setValue(text);
  };

  return (
    <div>
      <Editor
        className="min-h-[350px] rounded-lg flex flex-col items-center justify-center py-10 px-6"
        ref={mdEditor}
        value={value}
        onChange={handleEditorChange}
        renderHTML={(text) => marked(text)}
      />
    </div>
  );
};

export default MdEditorComponent;
