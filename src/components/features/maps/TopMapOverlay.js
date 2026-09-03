import React from "react";
import useTopMapOverlayLogic from "./TopMapOverlay.logic";
import TopMapOverlayView from "./TopMapOverlay.jsx";

const TopMapOverlay = (props) => {
  const logic = useTopMapOverlayLogic(props);
  return <TopMapOverlayView {...props} {...logic} />;
};

export default TopMapOverlay;
