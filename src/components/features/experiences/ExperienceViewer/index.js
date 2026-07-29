import React from 'react';
import { useExperienceViewerLogic } from './ExperienceViewer.logic';
import { ExperienceViewerTemplate } from './ExperienceViewer.jsx';

export default function ExperienceViewer(props) {
  const logic = useExperienceViewerLogic(props);
  return <ExperienceViewerTemplate logic={logic} {...props} />;
}
