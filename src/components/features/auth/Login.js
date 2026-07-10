import React, { useState } from "react";
import { FaEye, FaEyeSlash, FaShip } from "react-icons/fa";
import authService from "../../../api/services/authService";
import cotecmarLogo from "../../../assets/images/cotecmar-logo.png";
import "./Login.css";

const Login = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await authService.login(email, password);
      if (result.success) {
        onLoginSuccess(result.user);
      } else {
        setError(result.error);
        setPassword("");
      }
    } catch (err) {
      setError("Error al iniciar sesion");
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="login-overlay" />
      </div>

      <div className="login-box">
        <div className="login-header">
          <img src={cotecmarLogo} alt="COTECMAR" className="login-logo" />
          <h1>Portal RV360</h1>
          <p>Accede a tu cuenta</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group-login">
            <label htmlFor="email">Correo electronico</label>
            <div className="password-input-container">
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="correo@empresa.com"
                autoFocus
                required
              />
            </div>
          </div>

          <div className="form-group-login">
            <label htmlFor="password">Contrasena</label>
            <div className="password-input-container">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Ingresa tu contrasena"
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <label className="remember-row">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(event) => setRememberMe(event.target.checked)}
            />
            <span>Recordarme</span>
          </label>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? "Verificando..." : "Iniciar Sesion"}
          </button>
        </form>

        <div className="login-footer">
          <div className="login-divider">
            <span>Portal RV360</span>
          </div>
          <p className="hint-text">
            <FaShip /> Sistema de Visualizacion 360° - COTECMAR
          </p>
          <p className="support-text">Necesitas ayuda? Contacta al administrador</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
