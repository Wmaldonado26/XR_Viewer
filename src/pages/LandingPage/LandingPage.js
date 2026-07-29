import React from 'react';
import { useLandingPageLogic } from './LandingPage.logic';
import { LandingPageTemplate } from './LandingPage.jsx';

const LandingPage = () => {
  const logic = useLandingPageLogic();
  return <LandingPageTemplate {...logic} />;
};

export default LandingPage;
