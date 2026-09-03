import React from "react";
import useProjectEditorLogic from "./ProjectEditor.logic";
import ProjectEditorView from "./ProjectEditor.jsx";

export default function ProjectEditor(props) {
  const logic = useProjectEditorLogic(props);
  return <ProjectEditorView {...props} {...logic} />;
}
