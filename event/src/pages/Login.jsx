import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import "./style/Login.css";

const Login = () => {
  const { login, signup, showToast } = useApp();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    password: "",
  });

  const handleChange = (e) => {
    // Single handler rakha hai taki form fields easily manage ho jaye.
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Yahi par login aur signup dono flow toggle ke basis par handle kar raha hu.
    if (isLogin) {
      if (login(formData.username, formData.password)) {
        navigate("/dashboard");
      } else {
        showToast("Invalid credentials", "error");
      }
    } else {
      if (signup(formData.name, formData.username, formData.password)) {
        navigate("/dashboard");
      } else {
        showToast("Username already exists", "error");
      }
    }
  };

  return (
    <div className="login-page flex min-h-screen items-center justify-center bg-[linear-gradient(135deg,#eef4ff_0%,#e0ecff_45%,#f8fbff_100%)] px-4 py-8">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8">
        <div className="mb-6 text-center">
          <img
            src="/eventra-logo.jpeg"
            alt="Eventra logo"
            className="mx-auto mb-4 h-14 w-14 rounded-2xl object-cover shadow-sm"
          />
          <h2 className="text-3xl font-bold text-slate-900">
            {isLogin ? "Login" : "Create account"}
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            {isLogin
              ? "Access your dashboard and manage your events easily."
              : "Create your account to start managing events and tasks."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="text-left">
              <label className="block text-sm font-semibold text-slate-700">
                Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required={!isLogin}
                className="mt-2 block w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
              />
            </div>
          )}
          <div className="text-left">
            <label className="block text-sm font-semibold text-slate-700">
              Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              className="mt-2 block w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
            />
          </div>
          <div className="text-left">
            <label className="block text-sm font-semibold text-slate-700">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="mt-2 block w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            {isLogin ? "Login" : "Sign Up"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="font-semibold text-indigo-600 transition hover:text-indigo-500"
          >
            {isLogin
              ? "Need an account? Sign Up"
              : "Already have an account? Login"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
