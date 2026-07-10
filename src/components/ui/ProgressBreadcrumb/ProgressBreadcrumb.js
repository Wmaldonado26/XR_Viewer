import React from "react";
import { FaHome, FaMapMarkerAlt, FaShip } from "react-icons/fa";
import "./ProgressBreadcrumb.css";

const steps = [
  { key: "home", label: "Inicio", icon: <FaHome /> },
  { key: "project", label: "Proyecto", icon: <FaShip /> },
  { key: "viewer", label: "Vista 360°", icon: <FaMapMarkerAlt /> },
];

const stepIndex = {
  home: 0,
  project: 1,
  viewer: 2,
};

const ProgressBreadcrumb = ({ activeStep = "home", className = "" }) => {
  const currentIndex = stepIndex[activeStep] ?? 0;
  const visibleSteps = steps.slice(0, currentIndex + 1);

  return (
    <nav className={`progress-breadcrumb ${className}`.trim()} aria-label="Breadcrumb">
      {visibleSteps.map((step, index) => {
        const isActive = index === currentIndex;
        const isCompleted = index < currentIndex;

        return (
          <React.Fragment key={step.key}>
            <div
              className={`progress-breadcrumb__item${
                isActive ? " is-active" : ""
              }${isCompleted ? " is-completed" : ""}`}
            >
              <span className="progress-breadcrumb__icon">{step.icon}</span>
              <span>{step.label}</span>
            </div>
            {index < visibleSteps.length - 1 && (
              <div
                className={`progress-breadcrumb__separator${
                  index < currentIndex ? " is-active" : ""
                }`}
              >
                <span className="progress-breadcrumb__line" />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default ProgressBreadcrumb;
