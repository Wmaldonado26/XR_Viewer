import React from 'react';
import { useExperienceSelectorLogic } from './ExperienceSelector.logic';
import { ExperienceSelectorTemplate } from './ExperienceSelector.jsx';

export default function ExperienceSelector(props) {
  const logic = useExperienceSelectorLogic(props);
  return <ExperienceSelectorTemplate logic={logic} {...props} />;
}
