import React, { useEffect, useState } from "react";
import { Navigate, Route, Routes, useNavigate, useParams } from "react-router-dom";
import Scene from "../components/features/experiences/ExperienceViewer";
import ExperienceSelector from "../components/features/experiences/ExperienceSelector";
import ProjectDetails from "../components/features/projects/ProjectDetails";
import ProjectManager from "../components/features/projects/ProjectManager";
import ProjectGallery from "../components/features/projects/ProjectGallery";
import ProjectEditor from "../components/features/projects/ProjectEditor";
import HotspotVisualEditor from "../components/features/hotspots/HotspotVisualEditor";
import Login from "../components/features/auth/Login";
import UserManagement from "../components/features/users/UserManagement";
import UserPermissions from "../components/features/users/UserPermissions";
import ConfirmModal from "../components/common/Modal/ConfirmModal";
import LandingPage from "../pages/LandingPage/LandingPage";
import LandingCardsAdmin from "../components/features/landing/LandingCardsAdmin";
import PagesInformations from "../components/ui/PagesInformations/PagesInformations";
import authService from "../api/services/authService";
import projectService from "../api/services/projectService";
import PrivateRoute from "./PrivateRoute";
import PublicRoute from "./PublicRoute";

const ProjectViewerWrapper = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  useEffect(() => {
    const loadProject = async () => {
      if (!projectId) return;

      const proj = await projectService.getProjectById(projectId);
      if (proj) {
        setProject(proj);
        projectService.setActiveProject(projectId);
      } else {
        navigate("/gallery");
      }
    };

    loadProject();
  }, [projectId, navigate]);

  const handleExperienceSelect = (experienceId) => {
    navigate(`/project/${projectId}/experience/${experienceId}`);
  };

  const handleViewDetails = () => {
    navigate(`/project/${projectId}/details`);
  };

  if (!project) {
    return <div className="loading-screen">Cargando proyecto...</div>;
  }

  return (
    <>
      <ExperienceSelector
        onExperienceSelect={handleExperienceSelect}
        onViewDetails={handleViewDetails}
        onBackToManager={() => {
          const user = authService.getCurrentUser();
          navigate((user?.role === "admin" || user?.role === "project_admin") ? "/admin" : "/gallery");
        }}
        onAccessAdmin={() => navigate("/admin/login")}
      />
    </>
  );
};

const ExperienceViewerWrapper = () => {
  const { projectId, experienceId } = useParams();
  const navigate = useNavigate();
  useEffect(() => {
    if (projectId) {
      projectService.setActiveProject(projectId);
    }
  }, [projectId]);

  return (
    <Scene
      selectedExperience={experienceId}
      onBackToSelector={() => navigate(`/project/${projectId}`)}
    />
  );
};

const ProjectDetailsWrapper = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (projectId) {
      projectService.setActiveProject(projectId);
    }
  }, [projectId]);

  return <ProjectDetails onBack={() => navigate(`/project/${projectId}`)} />;
};

const LoginWrapper = () => {
  const navigate = useNavigate();

  const handleLoginSuccess = (user) => {
    navigate((user?.role === "admin" || user?.role === "project_admin") ? "/admin" : "/gallery");
  };

  return <Login onLoginSuccess={handleLoginSuccess} />;
};

const AdminWrapper = () => {
  const navigate = useNavigate();
  const [modal, setModal] = useState({
    isOpen: false,
    type: "alert",
    title: "",
    message: "",
    onConfirm: null,
  });

  const handleSelectProject = (project) => {
    navigate(`/project/${project.id}`);
  };

  const handleCreateNewProject = async () => {
    const result = await projectService.createProject({
      name: "Nuevo Proyecto",
      description: "Proyecto creado desde el gestor",
      vesselType: "Embarcacion",
    });

    if (result.success) {
      navigate(`/admin/edit/${result.project.id}`);
    } else {
      setModal({
        isOpen: true,
        type: "danger",
        title: "Error al Crear Proyecto",
        message: `No se pudo crear el proyecto: ${result.error}`,
        onConfirm: () => setModal((prev) => ({ ...prev, isOpen: false })),
        showCancelButton: false,
        confirmText: "Aceptar",
      });
    }
  };

  const handleViewDetails = () => {
    const activeProject = projectService.getActiveProject();
    if (activeProject) {
      navigate(`/project/${activeProject.id}/details`);
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  const handleManageUsers = () => {
    navigate("/admin/users");
  };

  const handleManagePermissions = () => {
    navigate("/admin/permissions");
  };

  return (
    <>
      <ProjectManager
        onSelectProject={handleSelectProject}
        onCreateNew={handleCreateNewProject}
        onViewDetails={handleViewDetails}
        onManageUsers={handleManageUsers}
        onManagePermissions={handleManagePermissions}
        onLogout={handleLogout}
      />
      <ConfirmModal
        isOpen={modal.isOpen}
        onClose={() => setModal({ ...modal, isOpen: false })}
        onConfirm={modal.onConfirm}
        title={modal.title}
        message={modal.message}
        type={modal.type}
        confirmText={modal.confirmText}
        showCancelButton={modal.showCancelButton !== false}
      />
    </>
  );
};

const UserManagementWrapper = () => {
  const navigate = useNavigate();

  return <UserManagement onBack={() => navigate("/admin")} />;
};

const UserPermissionsWrapper = () => {
  const navigate = useNavigate();

  return <UserPermissions onBack={() => navigate("/admin")} />;
};

const LandingCardsAdminWrapper = () => {
  return <LandingCardsAdmin />;
};

const ProjectEditorWrapper = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const handleClose = () => {
    navigate("/admin");
  };

  const handleSave = () => {
    navigate("/admin");
  };

  return (
    <ProjectEditor
      projectId={projectId}
      onClose={handleClose}
      onSave={handleSave}
    />
  );
};

const HotspotVisualEditorWrapper = () => {
  const { projectId, sceneKey } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);

  useEffect(() => {
    const loadProject = async () => {
      const proj = await projectService.getProjectById(projectId);
      setProject(proj);
    };

    loadProject();
  }, [projectId]);

  const handleClose = () => {
    navigate(`/admin/edit/${projectId}`);
  };

  const handleSave = async (updatedScene) => {
    if (!project) return;

    const updatedProject = {
      ...project,
      scenes: {
        ...project.scenes,
        [sceneKey]: {
          ...project.scenes[sceneKey],
          hotSpots: updatedScene.hotSpots,
        },
      },
    };

    await projectService.saveProject(updatedProject);
    navigate(`/admin/edit/${projectId}`);
  };

  if (!project || !project.scenes || !project.scenes[sceneKey]) {
    return <div className="loading-screen">Cargando escena...</div>;
  }

  return (
    <HotspotVisualEditor
      projectId={projectId}
      scene={project.scenes[sceneKey]}
      sceneKey={sceneKey}
      allScenes={project.scenes}
      onSave={handleSave}
      onClose={handleClose}
    />
  );
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />

      <Route
        path="/gallery"
        element={
          <PrivateRoute roles={["admin", "project_admin", "user"]}>
            <ProjectGallery />
          </PrivateRoute>
        }
      />

      <Route
        path="/project/:projectId"
        element={
          <PrivateRoute roles={["admin", "project_admin", "user"]}>
            <ProjectViewerWrapper />
          </PrivateRoute>
        }
      />
      <Route
        path="/project/:projectId/experience/:experienceId"
        element={
          <PrivateRoute roles={["admin", "project_admin", "user"]}>
            <ExperienceViewerWrapper />
          </PrivateRoute>
        }
      />
      <Route
        path="/public-tour/:projectId/:experienceId"
        element={
          <PublicRoute redirectByRole={false}>
            <ExperienceViewerWrapper />
          </PublicRoute>
        }
      />
      <Route
        path="/project/:projectId/details"
        element={
          <PrivateRoute roles={["admin", "project_admin", "user"]}>
            <ProjectDetailsWrapper />
          </PrivateRoute>
        }
      />

      <Route
        path="/pages/information"
        element={
          <PrivateRoute roles={["admin", "project_admin", "user"]}>
            <PagesInformations />
          </PrivateRoute>
        }
      />

      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginWrapper />
          </PublicRoute>
        }
      />
      <Route path="/admin/login" element={<Navigate to="/login" replace />} />

      <Route
        path="/admin"
        element={
          <PrivateRoute roles={["admin", "project_admin"]}>
            <AdminWrapper />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <PrivateRoute roles={["admin"]}>
            <UserManagementWrapper />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/permissions"
        element={
          <PrivateRoute roles={["admin"]}>
            <UserPermissionsWrapper />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/landing"
        element={
          <PrivateRoute roles={["admin", "project_admin"]}>
            <LandingCardsAdminWrapper />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/edit/:projectId"
        element={
          <PrivateRoute roles={["admin", "project_admin"]}>
            <ProjectEditorWrapper />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/edit/:projectId/scene/:sceneKey"
        element={
          <PrivateRoute roles={["admin", "project_admin"]}>
            <HotspotVisualEditorWrapper />
          </PrivateRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
