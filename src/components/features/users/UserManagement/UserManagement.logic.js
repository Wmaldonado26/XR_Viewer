import { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import userService from "../../../../api/services/userService";
import authService from "../../../../api/services/authService";

const emptyForm = {
  id: null,
  name: "",
  email: "",
  phone: "",
  password: "",
  role: "user",
  isActive: true,
  projectIds: [],
};

export const useUserManagementLogic = ({ onBack, onLogout, darkMode, onToggleDarkMode }) => {
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();
  const sidebarRef = useRef(null);

  const [showSidebar, setShowSidebar] = useState(false);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [modal, setModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("all");

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch = user.name?.toLowerCase().includes(searchQuery.toLowerCase()) || user.email?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = filterRole === "all" || user.role === filterRole;
      return matchesSearch && matchesRole;
    });
  }, [users, searchQuery, filterRole]);

  useEffect(() => {
    const handleSidebarClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        const hamburgerBtn = document.querySelector(".hamburger-btn");
        if (!hamburgerBtn || !hamburgerBtn.contains(event.target)) {
          setShowSidebar(false);
        }
      }
    };
    if (showSidebar) {
      document.addEventListener("mousedown", handleSidebarClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleSidebarClickOutside);
  }, [showSidebar]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      const usersData = await userService.getAllUsers();
      setUsers(usersData);
    } catch (err) {
      setError(err.message || "No se pudo cargar la gestión de usuarios");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm(emptyForm);
    setError("");
    setMessage("");
  };

  const startEdit = (user) => {
    setForm({
      id: user.id,
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      password: "",
      role: user.role || "user",
      isActive: Boolean(user.isActive),
      projectIds: user.projectIds || [],
    });
    setMessage("");
    setError("");
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
      ...(field === "role" && value === "admin" ? { projectIds: [] } : {}),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const payload = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        role: form.role,
        isActive: form.isActive,
        projectIds: form.role === "user" ? form.projectIds : [],
      };

      if (form.id) {
        await userService.updateUser(form.id, payload);
        setMessage("Usuario actualizado correctamente.");
      } else {
        await userService.createUser(payload);
        setMessage("Usuario creado correctamente.");
      }

      await loadData();
      resetForm();
    } catch (err) {
      setError(err.message || "No se pudo guardar el usuario");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (user) => {
    setModal({
      isOpen: true,
      title: "Eliminar usuario",
      message: `Se eliminará la cuenta de ${user.name}. Esta acción no se puede deshacer.`,
      onConfirm: async () => {
        try {
          await userService.deleteUser(user.id);
          setMessage("Usuario eliminado correctamente.");
          if (form.id === user.id) {
            resetForm();
          }
          await loadData();
        } catch (err) {
          setError(err.message || "No se pudo eliminar el usuario");
        } finally {
          setModal((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  return {
    navigate,
    currentUser,
    sidebarRef,
    showSidebar, setShowSidebar,
    users,
    form,
    loading,
    saving,
    message,
    error,
    modal, setModal,
    searchQuery, setSearchQuery,
    filterRole, setFilterRole,
    filteredUsers,
    resetForm,
    startEdit,
    handleChange,
    handleSubmit,
    handleDelete
  };
};
