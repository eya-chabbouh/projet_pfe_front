"use client";

import type React from "react";
import { useEffect, useState } from "react";
import axios from "axios";
import {
  User,
  Mail,
  Phone,
  Lock,
  Camera,
  Eye,
  EyeOff,
  Check,
  X,
  AlertCircle,
  Save,
  Edit3,
  Shield,
} from "lucide-react";
import AdminLayout from "../components/AdminLayout/page";

export default function AdminProfile() {
  const [admin, setAdmin] = useState({
    name: "",
    email: "",
    tel: "",
    photo: "",
    role: "",
  });

  const [newPhoto, setNewPhoto] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Validation state
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    tel: "",
    password: "",
    passwordConfirmation: "",
    currentPassword: "",
    general: "",
  });

  // Track modified fields
  const [modifiedFields, setModifiedFields] = useState({
    name: false,
    email: false,
    tel: false,
    currentPassword: false,
    password: false,
    passwordConfirmation: false,
  });

  const getDefaultAvatar = (role: string) => {
    return "/placeholder.svg?height=96&width=96";
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const validateField = (field: string, value: string) => {
    const newErrors = { ...errors };

    if (field === "name") {
      if (!value.trim()) {
        newErrors.name = "Le nom est requis";
      } else if (value.length < 2) {
        newErrors.name = "Le nom doit contenir au moins 2 caractères";
      } else {
        newErrors.name = "";
      }
    }

    if (field === "email") {
      if (!value.trim()) {
        newErrors.email = "L'email est requis";
      } else if (!/\S+@\S+\.\S+/.test(value)) {
        newErrors.email = "L'email n'est pas valide";
      } else {
        newErrors.email = "";
      }
    }

    if (field === "tel") {
      if (!value.trim()) {
        newErrors.tel = "Le numéro de téléphone est requis";
      } else if (!/^\+?[\d\s-]{8,}$/.test(value)) {
        newErrors.tel = "Le numéro de téléphone n'est pas valide";
      } else {
        newErrors.tel = "";
      }
    }

    if (field === "currentPassword") {
      if (showPasswordFields && !value) {
        newErrors.currentPassword = "Le mot de passe actuel est requis";
      } else {
        newErrors.currentPassword = "";
      }
    }

    if (field === "password") {
      if (value && value.length !== 8) {
        newErrors.password = "Le mot de passe doit contenir exactement 8 caractères";
      } else {
        newErrors.password = "";
      }
      if (passwordConfirmation && value !== passwordConfirmation) {
        newErrors.passwordConfirmation = "Les mots de passe ne correspondent pas";
      } else {
        newErrors.passwordConfirmation = "";
      }
    }

    if (field === "passwordConfirmation") {
      if (password && value !== password) {
        newErrors.passwordConfirmation = "Les mots de passe ne correspondent pas";
      } else {
        newErrors.passwordConfirmation = "";
      }
    }

    setErrors(newErrors);
  };

  const validateForm = () => {
    const newErrors = {
      name: "",
      email: "",
      tel: "",
      password: "",
      passwordConfirmation: "",
      currentPassword: "",
      general: "",
    };
    let isValid = true;

    if (!admin.name.trim()) {
      newErrors.name = "Le nom est requis";
      isValid = false;
    } else if (admin.name.length < 2) {
      newErrors.name = "Le nom doit contenir au moins 2 caractères";
      isValid = false;
    }

    if (!admin.email.trim()) {
      newErrors.email = "L'email est requis";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(admin.email)) {
      newErrors.email = "L'email n'est pas valide";
      isValid = false;
    }

    if (!admin.tel.trim()) {
      newErrors.tel = "Le numéro de téléphone est requis";
      isValid = false;
    } else if (!/^\+?[\d\s-]{8,}$/.test(admin.tel)) {
      newErrors.tel = "Le numéro de téléphone n'est pas valide";
      isValid = false;
    }

    if (showPasswordFields) {
      if (!currentPassword) {
        newErrors.currentPassword = "Le mot de passe actuel est requis";
        isValid = false;
      }

      if (password && password.length !== 8) {
        newErrors.password = "Le mot de passe doit contenir exactement 8 caractères";
        isValid = false;
      }

      if (password && password !== passwordConfirmation) {
        newErrors.passwordConfirmation = "Les mots de passe ne correspondent pas";
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const { data: response } = await axios.get("http://localhost:8000/api/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const fetchedAdmin = {
        name: response.name ?? "",
        email: response.email ?? "",
        tel: response.tel ?? "",
        photo: response.photo ?? "",
        role: response.role ?? "client",
      };

      setAdmin(fetchedAdmin);
    } catch (error) {
      console.error("Erreur lors du chargement du profil :", error);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSuccessMessage("");
    setErrors({ ...errors, general: "" });

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append("name", admin.name);
    formData.append("email", admin.email);
    formData.append("tel", admin.tel);
    if (newPhoto) formData.append("photo", newPhoto);

    if (showPasswordFields && password) {
      formData.append("current_password", currentPassword);
      formData.append("password", password);
      formData.append("password_confirmation", passwordConfirmation);
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return;
      }

      const { data: response } = await axios.post("http://localhost:8000/api/profile/update", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setSuccessMessage(response.message || "Profil mis à jour avec succès !");
      setTimeout(() => setSuccessMessage(""), 4000);

      await fetchProfile();
      setCurrentPassword("");
      setPassword("");
      setPasswordConfirmation("");
      setShowPasswordFields(false);
      setNewPhoto(null);
      setModifiedFields({
        name: false,
        email: false,
        tel: false,
        currentPassword: false,
        password: false,
        passwordConfirmation: false,
      });
    } catch (error: any) {
      if (error.response?.data) {
        setErrors((prev) => ({ ...prev, general: error.response.data.error || "Une erreur s'est produite." }));
      } else {
        setErrors((prev) => ({ ...prev, general: "Une erreur inattendue s'est produite." }));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setNewPhoto(file);
  };

  const handleCancelPhoto = () => {
    setNewPhoto(null);
  };

  const getFieldStatus = (field: string, value: string, isModified: boolean): boolean => {
    if (!isModified) return false;

    switch (field) {
      case "name":
        return !!value.trim() && value.length >= 2;
      case "email":
        return !!value.trim() && /\S+@\S+\.\S+/.test(value);
      case "tel":
        return !!value.trim() && /^\+?[\d\s-]{8,}$/.test(value);
      case "currentPassword":
        return !!value;
      case "password":
        return value.length === 8;
      case "passwordConfirmation":
        return !!(password && value === password);
      default:
        return false;
    }
  };

  return (
    <AdminLayout>
      <div className="p-4">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Mon Profil
                </h1>
                <p className="text-sm text-gray-600">
                  Gérez vos informations personnelles et paramètres de sécurité
                </p>
              </div>
            </div>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="mb-4 bg-green-50 border border-green-200 text-green-700 p-3 rounded-lg flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span className="text-sm">{successMessage}</span>
            </div>
          )}

          {/* Error Message */}
          {errors.general && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">{errors.general}</span>
            </div>
          )}

          {/* Main Content */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Informations du Profil
              </h2>
            </div>

            <form onSubmit={handleProfileUpdate} className="p-6">
              {/* Photo de profil */}
              <div className="flex justify-center mb-6">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-3 border-white shadow-md bg-gradient-to-r from-blue-100 to-purple-100">
                    <img
                      src={
                        newPhoto
                          ? URL.createObjectURL(newPhoto)
                          : admin.photo
                            ? `http://localhost:8000/storage/${admin.photo}`
                            : getDefaultAvatar(admin.role)
                      }
                      alt="Photo de profil"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute inset-0 bg-black/50 flex justify-center items-center gap-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <label
                      htmlFor="photo-input"
                      className="bg-white text-gray-700 text-xs font-medium px-2 py-1 rounded-md cursor-pointer hover:bg-gray-100 transition-colors flex items-center gap-1"
                    >
                      <Camera className="w-3 h-3" />
                      Changer
                      <input
                        id="photo-input"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handlePhotoChange}
                      />
                    </label>
                    {newPhoto && (
                      <button
                        type="button"
                        onClick={handleCancelPhoto}
                        className="bg-red-500 text-white text-xs font-medium px-2 py-1 rounded-md hover:bg-red-600 transition-colors flex items-center gap-1"
                      >
                        <X className="w-3 h-3" />
                        Annuler
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Informations personnelles */}
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-gray-700">
                    Nom complet <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      value={admin.name}
                      onChange={(e) => {
                        setAdmin({ ...admin, name: e.target.value });
                        setModifiedFields({ ...modifiedFields, name: true });
                        validateField("name", e.target.value);
                      }}
                      className={`w-full pl-8 pr-8 py-2 border rounded-md focus:outline-none focus:ring-2 transition-all text-sm ${
                        modifiedFields.name
                          ? errors.name
                            ? "border-red-300 focus:ring-red-500/20 focus:border-red-500"
                            : getFieldStatus("name", admin.name, modifiedFields.name)
                              ? "border-green-300 focus:ring-green-500/20 focus:border-green-500"
                              : "border-gray-200 focus:ring-blue-500/20 focus:border-blue-500"
                          : "border-gray-200 focus:ring-blue-500/20 focus:border-blue-500"
                      }`}
                      placeholder="Entrez votre nom complet"
                    />
                    {modifiedFields.name && (
                      <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                        {errors.name ? (
                          <X className="w-4 h-4 text-red-500" />
                        ) : getFieldStatus("name", admin.name, modifiedFields.name) ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : null}
                      </div>
                    )}
                  </div>
                  {modifiedFields.name && errors.name && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.name}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-medium text-gray-700">
                    Adresse email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="email"
                      value={admin.email}
                      onChange={(e) => {
                        setAdmin({ ...admin, email: e.target.value });
                        setModifiedFields({ ...modifiedFields, email: true });
                        validateField("email", e.target.value);
                      }}
                      className={`w-full pl-8 pr-8 py-2 border rounded-md focus:outline-none focus:ring-2 transition-all text-sm ${
                        modifiedFields.email
                          ? errors.email
                            ? "border-red-300 focus:ring-red-500/20 focus:border-red-500"
                            : getFieldStatus("email", admin.email, modifiedFields.email)
                              ? "border-green-300 focus:ring-green-500/20 focus:border-green-500"
                              : "border-gray-200 focus:ring-blue-500/20 focus:border-blue-500"
                          : "border-gray-200 focus:ring-blue-500/20 focus:border-blue-500"
                      }`}
                      placeholder="Email"
                    />
                    {modifiedFields.email && (
                      <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                        {errors.email ? (
                          <X className="w-4 h-4 text-red-500" />
                        ) : getFieldStatus("email", admin.email, modifiedFields.email) ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : null}
                      </div>
                    )}
                  </div>
                  {modifiedFields.email && errors.email && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.email}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-medium text-gray-700">
                    Numéro de téléphone <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      value={admin.tel}
                      onChange={(e) => {
                        setAdmin({ ...admin, tel: e.target.value });
                        setModifiedFields({ ...modifiedFields, tel: true });
                        validateField("tel", e.target.value);
                      }}
                      className={`w-full pl-8 pr-8 py-2 border rounded-md focus:outline-none focus:ring-2 transition-all text-sm ${
                        modifiedFields.tel
                          ? errors.tel
                            ? "border-red-300 focus:ring-red-500/20 focus:border-red-500"
                            : getFieldStatus("tel", admin.tel, modifiedFields.tel)
                              ? "border-green-300 focus:ring-green-500/20 focus:border-green-500"
                              : "border-gray-200 focus:ring-blue-500/20 focus:border-blue-500"
                          : "border-gray-200 focus:ring-blue-500/20 focus:border-blue-500"
                      }`}
                      placeholder="+39 XXX XXX XXXX"
                    />
                    {modifiedFields.tel && (
                      <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                        {errors.tel ? (
                          <X className="w-4 h-4 text-red-500" />
                        ) : getFieldStatus("tel", admin.tel, modifiedFields.tel) ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : null}
                      </div>
                    )}
                  </div>
                  {modifiedFields.tel && errors.tel && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.tel}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-medium text-gray-700">Rôle</label>
                  <div className="relative">
                    <Shield className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      value={admin.role}
                      disabled
                      className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-500 cursor-not-allowed text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Section Mot de passe */}
              <div className="border-t border-gray-200 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-semibold text-gray-700 flex items-center gap-2">
                      <Lock className="w-4 h-4 text-purple-500" />
                      Sécurité du compte
                    </h3>
                    <p className="text-xs text-gray-600">
                      Modifiez votre mot de passe pour sécuriser votre compte
                    </p>
                  </div>
                  {!showPasswordFields && (
                    <button
                      type="button"
                      onClick={() => setShowPasswordFields(true)}
className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-md hover:from-blue-600 hover:to-purple-700 transition-all duration-200 text-xs font-medium"                    >
                      <Edit3 className="w-3 h-3" />
                      Modifier le mot de passe
                    </button>
                  )}
                </div>

                {showPasswordFields && (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="block text-xs font-medium text-gray-700">
                        Mot de passe actuel <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type={showCurrentPassword ? "text" : "password"}
                          value={currentPassword}
                          onChange={(e) => {
                            setCurrentPassword(e.target.value);
                            setModifiedFields({ ...modifiedFields, currentPassword: true });
                            validateField("currentPassword", e.target.value);
                          }}
                          className={`w-full pl-8 pr-10 py-2 border rounded-md focus:outline-none focus:ring-2 transition-all text-sm ${
                            modifiedFields.currentPassword
                              ? errors.currentPassword
                                ? "border-red-300 focus:ring-red-500/20 focus:border-red-500"
                                : getFieldStatus("currentPassword", currentPassword, modifiedFields.currentPassword)
                                  ? "border-green-300 focus:ring-green-500/20 focus:border-green-500"
                                  : "border-gray-200 focus:ring-blue-500/20 focus:border-blue-500"
                              : "border-gray-200 focus:ring-blue-500/20 focus:border-blue-500"
                          }`}
                          placeholder="Entrez votre mot de passe actuel"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {modifiedFields.currentPassword && errors.currentPassword && (
                        <p className="text-xs text-red-500 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.currentPassword}
                        </p>
                      )}
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="block text-xs font-medium text-gray-700">
                          Nouveau mot de passe <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <input
                            type={showNewPassword ? "text" : "password"}
                            value={password}
                            maxLength={8}
                            onChange={(e) => {
                              setPassword(e.target.value);
                              setModifiedFields({ ...modifiedFields, password: true });
                              validateField("password", e.target.value);
                            }}
                            className={`w-full pl-8 pr-10 py-2 border rounded-md focus:outline-none focus:ring-2 transition-all text-sm ${
                              modifiedFields.password
                                ? errors.password
                                  ? "border-red-300 focus:ring-red-500/20 focus:border-red-500"
                                  : getFieldStatus("password", password, modifiedFields.password)
                                    ? "border-green-300 focus:ring-green-500/20 focus:border-green-500"
                                    : "border-gray-200 focus:ring-blue-500/20 focus:border-blue-500"
                                : "border-gray-200 focus:ring-blue-500/20 focus:border-blue-500"
                            }`}
                            placeholder="8 caractères exactement"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        {modifiedFields.password && errors.password && (
                          <p className="text-xs text-red-500 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {errors.password}
                          </p>
                        )}
                      </div>

                      <div className="space-y-1">
                        <label className="block text-xs font-medium text-gray-700">
                          Confirmer le mot de passe <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            value={passwordConfirmation}
                            maxLength={8}
                            onChange={(e) => {
                              setPasswordConfirmation(e.target.value);
                              setModifiedFields({ ...modifiedFields, passwordConfirmation: true });
                              validateField("passwordConfirmation", e.target.value);
                            }}
                            className={`w-full pl-8 pr-10 py-2 border rounded-md focus:outline-none focus:ring-2 transition-all text-sm ${
                              modifiedFields.passwordConfirmation
                                ? errors.passwordConfirmation
                                  ? "border-red-300 focus:ring-red-500/20 focus:border-red-500"
                                  : getFieldStatus(
                                      "passwordConfirmation",
                                      passwordConfirmation,
                                      modifiedFields.passwordConfirmation,
                                    )
                                    ? "border-green-300 focus:ring-green-500/20 focus:border-green-500"
                                    : "border-gray-200 focus:ring-blue-500/20 focus:border-blue-500"
                                : "border-gray-200 focus:ring-blue-500/20 focus:border-blue-500"
                            }`}
                            placeholder="Confirmez votre mot de passe"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        {modifiedFields.passwordConfirmation && errors.passwordConfirmation && (
                          <p className="text-xs text-red-500 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {errors.passwordConfirmation}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-center">
                      <button
                        type="button"
                        onClick={() => {
                          setShowPasswordFields(false);
                          setPassword("");
                          setPasswordConfirmation("");
                          setCurrentPassword("");
                          setErrors({
                            ...errors,
                            password: "",
                            passwordConfirmation: "",
                            currentPassword: "",
                          });
                          setModifiedFields({
                            ...modifiedFields,
                            currentPassword: false,
                            password: false,
                            passwordConfirmation: false,
                          });
                        }}
                        className="text-red-500 hover:text-red-600 font-medium text-xs transition-colors flex items-center gap-1"
                      >
                        <X className="w-3 h-3" />
                        Annuler la modification du mot de passe
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Bouton Submit */}
              <div className="flex justify-center pt-6">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-md hover:from-blue-600 hover:to-purple-700 transition-all duration-200 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {isLoading ? "Mise à jour..." : "Mettre à jour le profil"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}