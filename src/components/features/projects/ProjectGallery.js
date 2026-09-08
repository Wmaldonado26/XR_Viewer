import React from "react";
import useProjectGalleryLogic from "./ProjectGallery.logic";
import ProjectGalleryView from "./ProjectGallery.jsx";

export default function ProjectGallery(props) {
  const logic = useProjectGalleryLogic(props);
  return <ProjectGalleryView {...props} {...logic} />;
}
