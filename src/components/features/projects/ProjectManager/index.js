import React from 'react';
import { useProjectManagerLogic } from './ProjectManager.logic';
import { ProjectManagerTemplate } from './ProjectManager.jsx';

export default function ProjectManager(props) {
  const logic = useProjectManagerLogic(props);
  return <ProjectManagerTemplate logic={logic} {...props} />;
}
