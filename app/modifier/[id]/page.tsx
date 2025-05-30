"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { FaUserEdit } from "react-icons/fa";
import AdminLayout from "@/app/components/AdminLayout/page";
import 'bootstrap/dist/css/bootstrap.min.css';

const EditUserPage = () => {
  const { id } = useParams();
  const router = useRouter();

  const [userField, setUserField] = useState({
    name: "",
    email: "",
    role: "",
    tel: "",
    photo: null,
  });

  const [errors, setErrors] = useState({
    name: "",
    email: "",
    tel: "",
  });

  const [touched, setTouched] = useState({
    name: false,
    email: false,
    tel: false,
  });

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:8000/api/users/${id}`);
        setUserField(response.data);
      } catch (err) {
        alert("Erreur lors de la récupération de l'utilisateur.");
      } finally {
        setLoading(false);
      }
    };

    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/login");
          return;
        }
        const response = await axios.get("http://127.0.0.1:8000/api/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(response.data);
      } catch (error) {
        console.error("Erreur user data", error);
      }
    };

    fetchUser();
    fetchUserData();
  }, [id, router]);

  const validateForm = () => {
    let isValid = true;
    const newErrors = { name: "", email: "", tel: "" };

    if (!userField.name.trim()) {
      newErrors.name = "Le nom est obligatoire";
      isValid = false;
    }
    if (!userField.email.trim()) {
      newErrors.email = "L'email est obligatoire";
      isValid = false;
    } else {
      const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
      const atSymbolCount = (userField.email.match(/@/g) || []).length;
      if (atSymbolCount !== 1) {
        newErrors.email = "L'email doit contenir exactement un symbole @";
        isValid = false;
      } else if (!emailRegex.test(userField.email)) {
        newErrors.email = "L'email n'est pas valide";
        isValid = false;
      }
    }
    if (!userField.tel.trim()) {
      newErrors.tel = "Le téléphone est obligatoire";
      isValid = false;
    } else if (!/^\d{8}$/.test(userField.tel)) {
      newErrors.tel = "Le téléphone doit contenir exactement 8 chiffres";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const isFieldValid = (field: keyof typeof userField) => {
    if (field === "name") return userField.name.trim();
    if (field === "email") {
      const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
      const atSymbolCount = (userField.email.match(/@/g) || []).length;
      return userField.email.trim() && atSymbolCount === 1 && emailRegex.test(userField.email);
    }
    if (field === "tel") return userField.tel.trim() && /^\d{8}$/.test(userField.tel);
    return true;
  };

  const changeUserFieldHandler = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === "tel") {
      if (!/^\d*$/.test(value)) return;
      if (value.length > 8) return;
    }
    setUserField({ ...userField, [name]: value });
    setTouched({ ...touched, [name]: true });
    setErrors({ ...errors, [name]: "" });
  };

  const onSubmitChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, email: true, tel: true });
    if (!validateForm()) return;

    const formData = new FormData();
    formData.append("_method", "PUT");
    formData.append("name", userField.name);
    formData.append("email", userField.email);
    formData.append("role", userField.role);
    formData.append("tel", userField.tel);

    try {
      await axios.post(`http://127.0.0.1:8000/api/users/${id}`, formData);
      router.push("/users");
    } catch (err) {
      alert("Erreur lors de la mise à jour.");
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-secondary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
        <span className="ms-2 text-secondary">Chargement...</span>
      </div>
    );
  }

  return (
    <AdminLayout>
      <style jsx>{`
        .fade-in {
          animation: fadeIn 0.6s ease-out;
        }
        .card-modern {
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          transition: box-shadow 0.3s ease;
        }
        .card-modern:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        .form-control {
          border-radius: 8px;
          transition: border-color 0.2s ease;
        }
        .form-control:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        .btn-primary-solid {
          background-color: #3b82f6;
          border: none;
          border-radius: 8px;
          transition: background-color 0.2s ease;
        }
        .btn-primary-solid:hover {
          background-color: #2563eb;
        }
        .btn-secondary-solid {
          background-color: #6b7280;
          border: none;
          border-radius: 8px;
          transition: background-color 0.2s ease;
        }
        .btn-secondary-solid:hover {
          background-color: #4b5563;
        }
        .input-group-text {
          border-radius: 8px 0 0 8px;
          background-color: #f9fafb;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
      <div className="container my-5">
        <div className="card card-modern shadow-sm p-4 max-w-md mx-auto fade-in">
          <h3 className="card-title text-center mb-4 d-flex align-items-center justify-content-center gap-2 text-dark">
            <FaUserEdit size={24} className="text-primary" />
            Modifier Utilisateur
          </h3>
          <form onSubmit={onSubmitChange} encType="multipart/form-data" className="space-y-5">
            <div className="mb-3">
              <label htmlFor="name" className="form-label fw-medium text-dark">
                Nom <span className="text-danger">*</span>
              </label>
              <div className="input-group">
                <span className="input-group-text">
                  <i className="fas fa-user text-secondary"></i>
                </span>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className={`form-control ${errors.name ? 'is-invalid' : touched.name && isFieldValid('name') ? 'is-valid' : ''}`}
                  value={userField.name}
                  onChange={changeUserFieldHandler}
                  placeholder="Entrez le nom"
                />
                {errors.name && <div className="invalid-feedback">{errors.name}</div>}
              </div>
            </div>
            <div className="mb-3">
              <label htmlFor="email" className="form-label fw-medium text-dark">
                Email <span className="text-danger">*</span>
              </label>
              <div className="input-group">
                <span className="input-group-text">
                  <i className="fas fa-envelope text-secondary"></i>
                </span>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className={`form-control ${errors.email ? 'is-invalid' : touched.email && isFieldValid('email') ? 'is-valid' : ''}`}
                  value={userField.email}
                  onChange={changeUserFieldHandler}
                  placeholder="Entrez l'email"
                />
                {errors.email && <div className="invalid-feedback">{errors.email}</div>}
              </div>
            </div>
            <div className="mb-3">
              <label htmlFor="tel" className="form-label fw-medium text-dark">
                Téléphone <span className="text-danger">*</span>
              </label>
              <div className="input-group">
                <span className="input-group-text">
                  <i className="fas fa-phone text-secondary"></i>
                </span>
                <input
                  type="text"
                  id="tel"
                  name="tel"
                  className={`form-control ${errors.tel ? 'is-invalid' : touched.tel && isFieldValid('tel') ? 'is-valid' : ''}`}
                  value={userField.tel}
                  onChange={changeUserFieldHandler}
                  placeholder="Entrez le téléphone (8 chiffres)"
                  pattern="\d{8}"
                  title="Le téléphone doit contenir exactement 8 chiffres"
                />
                {errors.tel && <div className="invalid-feedback">{errors.tel}</div>}
              </div>
            </div>
            <button type="submit" className="btn btn-primary w-100 py-2">
              Mettre à jour
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="btn btn-secondary w-100 py-2"
            >
              Annuler
            </button>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
};

export default EditUserPage;