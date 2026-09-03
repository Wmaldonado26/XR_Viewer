import React from "react";
import useProjectDetailsLogic from "./ProjectDetails.logic";
import ProjectDetailsView from "./ProjectDetails.jsx";

export default function ProjectDetails(props) {
  const logic = useProjectDetailsLogic(props);
  return <ProjectDetailsView {...props} {...logic} />;
}
