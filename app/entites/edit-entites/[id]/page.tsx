
"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import NavbarProps from "@/app/components/NavbarProps/page";

const EditEntitesPage = () => {
  const router = useRouter();
  const { id } = useParams();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [localisations, setLocalisations] = useState<string[]>([]);
  const [nomEntite, setNomEntite] = useState("");
  const [description, setDescription] = useState("");
  const [localisation, setLocalisation] = useState("");
  const [categId, setCategId] = useState<number | "">("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [userInfo, setUserInfo] = useState({
    name: "",
    email: "",
    tel: "",
  });
  const [passwordCurrent, setPasswordCurrent] = useState("");
  const [passwordNew, setPasswordNew] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Validation state
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    tel: "",
    nomEntite: "",
    description: "",
    localisation: "",
    passwordCurrent: "",
    passwordNew: "",
    passwordConfirm: "",
  });

  // Track modified fields
  const [modifiedFields, setModifiedFields] = useState({
    name: false,
    email: false,
    tel: false,
    nomEntite: false,
    description: false,
    localisation: false,
    passwordCurrent: false,
    passwordNew: false,
    passwordConfirm: false,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Token non disponible");

        setLocalisations([
          "Tunis", "Ariana", "Ben Arous", "La Manouba", "Nabeul", "Zaghouan", "Bizerte",
          "Béja", "Jendouba", "Le Kef", "Siliana", "Sousse", "Monastir", "Mahdia",
          "Sfax", "Kairouan", "Kasserine", "Sidi Bouzid", "Gabès", "Médenine",
          "Tataouine", "Gafsa", "Tozeur", "Kebili"
        ]);

        const [entiteRes, categoriesRes, userRes] = await Promise.all([
          fetch(`http://localhost:8000/api/entites/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("http://127.0.0.1:8000/api/categories", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("http://localhost:8000/api/user", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!entiteRes.ok || !categoriesRes.ok || !userRes.ok) {
          throw new Error("Erreur lors du chargement des données");
        }

        const entiteData = await entiteRes.json();
        const categoriesData = await categoriesRes.json();
        const userData = await userRes.json();

        setNomEntite(entiteData.nom_entites);
        setDescription(entiteData.description);
        setLocalisation(entiteData.localisation);
        setCategId(entiteData.categ_id);
        setImagePreview(`http://localhost:8000/storage/${entiteData.image}`);
        setCategories(categoriesData);
        setUserInfo({
          name: userData.name,
          email: userData.email,
          tel: userData.tel,
        });
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id]);

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

    if (field === "nomEntite") {
      if (!value.trim()) {
        newErrors.nomEntite = "Le nom du service est requis";
      } else if (value.length < 2) {
        newErrors.nomEntite = "Le nom du service doit contenir au moins 2 caractères";
      } else {
        newErrors.nomEntite = "";
      }
    }

    if (field === "description") {
      if (!value.trim()) {
        newErrors.description = "La description est requise";
      } else if (value.length < 10) {
        newErrors.description = "La description doit contenir au moins 10 caractères";
      } else {
        newErrors.description = "";
      }
    }

    if (field === "localisation") {
      if (!value) {
        newErrors.localisation = "La localisation est requise";
      } else {
        newErrors.localisation = "";
      }
    }

    if (field === "passwordCurrent" && showPasswordFields) {
      if (!value) {
        newErrors.passwordCurrent = "Le mot de passe actuel est requis";
      } else {
        newErrors.passwordCurrent = "";
      }
    }

    if (field === "passwordNew") {
      if (value && value.length !== 8) {
        newErrors.passwordNew = "Le mot de passe doit contenir exactement 8 caractères";
      } else {
        newErrors.passwordNew = "";
      }
      if (passwordConfirm && value !== passwordConfirm) {
        newErrors.passwordConfirm = "Les mots de passe ne correspondent pas";
      } else if (passwordConfirm) {
        newErrors.passwordConfirm = "";
      }
    }

    if (field === "passwordConfirm") {
      if (passwordNew && value !== passwordNew) {
        newErrors.passwordConfirm = "Les mots de passe ne correspondent pas";
      } else {
        newErrors.passwordConfirm = "";
      }
    }

    setErrors(newErrors);
  };

  const validateForm = () => {
    const newErrors = {
      name: "",
      email: "",
      tel: "",
      nomEntite: "",
      description: "",
      localisation: "",
      passwordCurrent: "",
      passwordNew: "",
      passwordConfirm: "",
    };
    let isValid = true;

    if (!userInfo.name.trim()) {
      newErrors.name = "Le nom est requis";
      isValid = false;
    } else if (userInfo.name.length < 2) {
      newErrors.name = "Le nom doit contenir au moins 2 caractères";
      isValid = false;
    }

    if (!userInfo.email.trim()) {
      newErrors.email = "L'email est requis";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(userInfo.email)) {
      newErrors.email = "L'email n'est pas valide";
      isValid = false;
    }

    if (!userInfo.tel.trim()) {
      newErrors.tel = "Le numéro de téléphone est requis";
      isValid = false;
    } else if (!/^\+?[\d\s-]{8,}$/.test(userInfo.tel)) {
      newErrors.tel = "Le numéro de téléphone n'est pas valide";
      isValid = false;
    }

    if (!nomEntite.trim()) {
      newErrors.nomEntite = "Le nom du service est requis";
      isValid = false;
    } else if (nomEntite.length < 2) {
      newErrors.nomEntite = "Le nom du service doit contenir au moins 2 caractères";
      isValid = false;
    }

    if (!description.trim()) {
      newErrors.description = "La description est requise";
      isValid = false;
    } else if (description.length < 10) {
      newErrors.description = "La description doit contenir au moins 10 caractères";
      isValid = false;
    }

    if (!localisation) {
      newErrors.localisation = "La localisation est requise";
      isValid = false;
    }

    if (showPasswordFields) {
      if (!passwordCurrent) {
        newErrors.passwordCurrent = "Le mot de passe actuel est requis";
        isValid = false;
      }
      if (passwordNew && passwordNew.length !== 8) {
        newErrors.passwordNew = "Le mot de passe doit contenir exactement 8 caractères";
        isValid = false;
      }
      if (passwordNew && passwordNew !== passwordConfirm) {
        newErrors.passwordConfirm = "Les mots de passe ne correspondent pas";
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleImageClick = () => fileInputRef.current?.click();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const cancelImage = () => {
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!validateForm()) {
      return;
    }

    const formData = new FormData();
    formData.append("nom_entites", nomEntite);
    formData.append("description", description);
    formData.append("localisation", localisation);
    if (categId !== "") formData.append("categ_id", String(categId));
    if (image) formData.append("image", image);
    formData.append("name", userInfo.name);
    formData.append("email", userInfo.email);
    formData.append("tel", userInfo.tel);

    if (showPasswordFields && passwordCurrent && passwordNew) {
      formData.append("current_password", passwordCurrent);
      formData.append("password", passwordNew);
      formData.append("password_confirmation", passwordConfirm);
    }

    formData.append("_method", "PUT");

    try {
      const res = await fetch(`http://localhost:8000/api/entites/${id}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Erreur lors de la mise à jour");
      }

      setSuccessMessage("Entité mise à jour avec succès !");
      setTimeout(() => {
        router.push("/dashbord2");
        setSuccessMessage("");
      }, 4000);

      setPasswordCurrent("");
      setPasswordNew("");
      setPasswordConfirm("");
      setShowPasswordFields(false);
      setImage(null);
      setImagePreview(null);
      setModifiedFields({
        name: false,
        email: false,
        tel: false,
        nomEntite: false,
        description: false,
        localisation: false,
        passwordCurrent: false,
        passwordNew: false,
        passwordConfirm: false,
      });
    } catch (error: any) {
      setError(error.message);
    }
  };

  if (loading) return <p className="text-center mt-8 text-gray-600">Chargement...</p>;

  return (
    <NavbarProps>
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm p-8 max-w-2xl mx-auto border border-gray-100">
          <h2 className="text-2xl font-semibold text-gray-800 mb-8 text-center">
            Modifier le Profil
          </h2>

          {successMessage && (
            <div className="mb-6 bg-green-50 text-green-700 p-4 rounded-lg text-sm font-medium animate-fade-in">
              {successMessage}
            </div>
          )}
          {error && (
            <div className="mb-6 bg-red-50 text-red-700 p-4 rounded-lg text-sm font-medium animate-fade-in">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6" encType="multipart/form-data">
            {/* Image Upload */}
            <div className="flex justify-center mb-8">
              <div className="relative group">
                <img
                  src={
                    imagePreview
                      ? imagePreview
                      : "/default-avatar.png"
                  }
                  alt="Photo de profil"
                  className="w-24 h-24 rounded-full object-cover border-2 border-gray-100 shadow-sm transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gray-900 bg-opacity-40 flex justify-center items-center gap-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <label
                    htmlFor="photo-input"
                    className="bg-white text-gray-700 text-xs font-medium px-2 py-1 rounded-md cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={handleImageClick}
                  >
                    Changer
                    <input
                      id="photo-input"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      ref={fileInputRef}
                      onChange={handleImageChange}
                    />
                  </label>
                  {imagePreview && (
                    <button
                      type="button"
                      onClick={cancelImage}
                      className="bg-white text-red-600 text-xs font-medium px-2 py-1 rounded-md hover:bg-red-50 transition-colors"
                    >
                      Annuler
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Personal Info */}
            <div className="space-y-6">
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom du Prestataire <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={userInfo.name}
                  onChange={(e) => {
                    setUserInfo({ ...userInfo, name: e.target.value });
                    setModifiedFields({ ...modifiedFields, name: true });
                    validateField("name", e.target.value);
                  }}
                  className={`w-full px-4 py-2 rounded-lg border bg-gray-50 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${
                    modifiedFields.name
                      ? errors.name
                        ? "border-red-400 focus:ring-red-400"
                        : userInfo.name && userInfo.name.length >= 2
                        ? "border-green-400 focus:ring-green-400"
                        : "border-gray-200 focus:ring-blue-300"
                      : "border-gray-200 focus:ring-blue-300"
                  }`}
                />
                {modifiedFields.name && errors.name && (
                  <p className="mt-1 text-xs text-red-400">{errors.name}</p>
                )}
                {modifiedFields.name && userInfo.name && userInfo.name.length >= 2 && !errors.name && (
                  <p className="mt-1 text-xs text-green-400">✓ Valide</p>
                )}
              </div>
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  value={userInfo.email}
                  onChange={(e) => {
                    setUserInfo({ ...userInfo, email: e.target.value });
                    setModifiedFields({ ...modifiedFields, email: true });
                    validateField("email", e.target.value);
                  }}
                  className={`w-full px-4 py-2 rounded-lg border bg-gray-50 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${
                    modifiedFields.email
                      ? errors.email
                        ? "border-red-400 focus:ring-red-400"
                        : userInfo.email && /\S+@\S+\.\S+/.test(userInfo.email)
                        ? "border-green-400 focus:ring-green-400"
                        : "border-gray-200 focus:ring-blue-300"
                      : "border-gray-200 focus:ring-blue-300"
                  }`}
                />
                {modifiedFields.email && errors.email && (
                  <p className="mt-1 text-xs text-red-400">{errors.email}</p>
                )}
                {modifiedFields.email && userInfo.email && /\S+@\S+\.\S+/.test(userInfo.email) && !errors.email && (
                  <p className="mt-1 text-xs text-green-400">✓ Valide</p>
                )}
              </div>
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Téléphone <span className="text-red-400">*</span>
                </label>
                <input
                  type="tel"
                  value={userInfo.tel}
                  onChange={(e) => {
                    setUserInfo({ ...userInfo, tel: e.target.value });
                    setModifiedFields({ ...modifiedFields, tel: true });
                    validateField("tel", e.target.value);
                  }}
                  className={`w-full px-4 py-2 rounded-lg border bg-gray-50 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${
                    modifiedFields.tel
                      ? errors.tel
                        ? "border-red-400 focus:ring-red-400"
                        : userInfo.tel && /^\+?[\d\s-]{8,}$/.test(userInfo.tel)
                        ? "border-green-400 focus:ring-green-400"
                        : "border-gray-200 focus:ring-blue-300"
                      : "border-gray-200 focus:ring-blue-300"
                  }`}
                />
                {modifiedFields.tel && errors.tel && (
                  <p className="mt-1 text-xs text-red-400">{errors.tel}</p>
                )}
                {modifiedFields.tel && userInfo.tel && /^\+?[\d\s-]{8,}$/.test(userInfo.tel) && !errors.tel && (
                  <p className="mt-1 text-xs text-green-400">✓ Valide</p>
                )}
              </div>
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom du service <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={nomEntite}
                  onChange={(e) => {
                    setNomEntite(e.target.value);
                    setModifiedFields({ ...modifiedFields, nomEntite: true });
                    validateField("nomEntite", e.target.value);
                  }}
                  className={`w-full px-4 py-2 rounded-lg border bg-gray-50 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${
                    modifiedFields.nomEntite
                      ? errors.nomEntite
                        ? "border-red-400 focus:ring-red-400"
                        : nomEntite && nomEntite.length >= 2
                        ? "border-green-400 focus:ring-green-400"
                        : "border-gray-200 focus:ring-blue-300"
                      : "border-gray-200 focus:ring-blue-300"
                  }`}
                />
                {modifiedFields.nomEntite && errors.nomEntite && (
                  <p className="mt-1 text-xs text-red-400">{errors.nomEntite}</p>
                )}
                {modifiedFields.nomEntite && nomEntite && nomEntite.length >= 2 && !errors.nomEntite && (
                  <p className="mt-1 text-xs text-green-400">✓ Valide</p>
                )}
              </div>
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    setModifiedFields({ ...modifiedFields, description: true });
                    validateField("description", e.target.value);
                  }}
                  rows={4}
                  className={`w-full px-4 py-2 rounded-lg border bg-gray-50 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${
                    modifiedFields.description
                      ? errors.description
                        ? "border-red-400 focus:ring-red-400"
                        : description && description.length >= 10
                        ? "border-green-400 focus:ring-green-400"
                        : "border-gray-200 focus:ring-blue-300"
                      : "border-gray-200 focus:ring-blue-300"
                  }`}
                />
                {modifiedFields.description && errors.description && (
                  <p className="mt-1 text-xs text-red-400">{errors.description}</p>
                )}
                {modifiedFields.description && description && description.length >= 10 && !errors.description && (
                  <p className="mt-1 text-xs text-green-400">✓ Valide</p>
                )}
              </div>
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Localisation <span className="text-red-400">*</span>
                </label>
                <select
                  value={localisation}
                  onChange={(e) => {
                    setLocalisation(e.target.value);
                    setModifiedFields({ ...modifiedFields, localisation: true });
                    validateField("localisation", e.target.value);
                  }}
                  className={`w-full px-4 py-2 rounded-lg border bg-gray-50 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${
                    modifiedFields.localisation
                      ? errors.localisation
                        ? "border-red-400 focus:ring-red-400"
                        : localisation
                        ? "border-green-400 focus:ring-green-400"
                        : "border-gray-200 focus:ring-blue-300"
                      : "border-gray-200 focus:ring-blue-300"
                  }`}
                >
                  <option value="">-- Choisir une localisation --</option>
                  {localisations.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
                {modifiedFields.localisation && errors.localisation && (
                  <p className="mt-1 text-xs text-red-400">{errors.localisation}</p>
                )}
                {modifiedFields.localisation && localisation && !errors.localisation && (
                  <p className="mt-1 text-xs text-green-400">✓ Valide</p>
                )}
              </div>
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Catégorie
                </label>
                <input
                  type="text"
                  value={categories.find((cat) => cat.id === categId)?.nom || ""}
                  readOnly
                  className="w-full px-4 py-2 rounded-lg border bg-gray-50 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all border-gray-200 focus:ring-blue-300"
                />
              </div>
            </div>

            {/* Password Fields */}
            {!showPasswordFields ? (
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setShowPasswordFields(true)}
                  className="text-blue-500 hover:text-blue-600 font-medium text-sm transition-colors"
                >
                  Modifier le mot de passe
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="form-group">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mot de passe actuel <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="password"
                    value={passwordCurrent}
                    onChange={(e) => {
                      setPasswordCurrent(e.target.value);
                      setModifiedFields({ ...modifiedFields, passwordCurrent: true });
                      validateField("passwordCurrent", e.target.value);
                    }}
                    className={`w-full px-4 py-2 rounded-lg border bg-gray-50 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${
                      modifiedFields.passwordCurrent
                        ? errors.passwordCurrent
                          ? "border-red-400 focus:ring-red-400"
                          : passwordCurrent
                          ? "border-green-400 focus:ring-green-400"
                          : "border-gray-200 focus:ring-blue-300"
                        : "border-gray-200 focus:ring-blue-300"
                    }`}
                  />
                  {modifiedFields.passwordCurrent && errors.passwordCurrent && (
                    <p className="mt-1 text-xs text-red-400">{errors.passwordCurrent}</p>
                  )}
                  {modifiedFields.passwordCurrent && passwordCurrent && !errors.passwordCurrent && (
                    <p className="mt-1 text-xs text-green-400">✓ Valide</p>
                  )}
                </div>
                <div className="form-group">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nouveau mot de passe <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="password"
                    value={passwordNew}
                    maxLength={8}
                    onChange={(e) => {
                      setPasswordNew(e.target.value);
                      setModifiedFields({ ...modifiedFields, passwordNew: true });
                      validateField("passwordNew", e.target.value);
                    }}
                    className={`w-full px-4 py-2 rounded-lg border bg-gray-50 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${
                      modifiedFields.passwordNew
                        ? errors.passwordNew
                          ? "border-red-400 focus:ring-red-400"
                          : passwordNew && passwordNew.length === 8
                          ? "border-green-400 focus:ring-green-400"
                          : "border-gray-200 focus:ring-blue-300"
                        : "border-gray-200 focus:ring-blue-300"
                    }`}
                  />
                  {modifiedFields.passwordNew && errors.passwordNew && (
                    <p className="mt-1 text-xs text-red-400">{errors.passwordNew}</p>
                  )}
                  {modifiedFields.passwordNew && passwordNew && passwordNew.length === 8 && !errors.passwordNew && (
                    <p className="mt-1 text-xs text-green-400">✓ Valide</p>
                  )}
                </div>
                <div className="form-group">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirmer le mot de passe <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="password"
                    value={passwordConfirm}
                    maxLength={8}
                    onChange={(e) => {
                      setPasswordConfirm(e.target.value);
                      setModifiedFields({ ...modifiedFields, passwordConfirm: true });
                      validateField("passwordConfirm", e.target.value);
                    }}
                    className={`w-full px-4 py-2 rounded-lg border bg-gray-50 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${
                      modifiedFields.passwordConfirm
                        ? errors.passwordConfirm
                          ? "border-red-400 focus:ring-red-400"
                          : passwordConfirm && passwordConfirm === passwordNew
                          ? "border-green-400 focus:ring-green-400"
                          : "border-gray-200 focus:ring-blue-300"
                        : "border-gray-200 focus:ring-blue-300"
                    }`}
                  />
                  {modifiedFields.passwordConfirm && errors.passwordConfirm && (
                    <p className="mt-1 text-xs text-red-400">{errors.passwordConfirm}</p>
                  )}
                  {modifiedFields.passwordConfirm && passwordConfirm && passwordConfirm === passwordNew && !errors.passwordConfirm && (
                    <p className="mt-1 text-xs text-green-400">✓ Valide</p>
                  )}
                </div>
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordFields(false);
                      setPasswordCurrent("");
                      setPasswordNew("");
                      setPasswordConfirm("");
                      setErrors({
                        ...errors,
                        passwordCurrent: "",
                        passwordNew: "",
                        passwordConfirm: "",
                      });
                      setModifiedFields({
                        ...modifiedFields,
                        passwordCurrent: false,
                        passwordNew: false,
                        passwordConfirm: false,
                      });
                    }}
                    className="text-red-500 hover:text-red-600 font-medium text-sm transition-colors"
                  >
                    Annuler la modification du mot de passe
                  </button>
                </div>
              </div>
            )}

            {/* Submit and Cancel Buttons */}
            <div className="flex justify-center gap-4">
              <button
                type="submit"
                className="w-full bg-blue-500 text-white py-2.5 rounded-lg font-medium text-sm hover:bg-blue-600 transition-colors duration-300"
              >
                Mettre à jour
              </button>
              <button
                type="button"
                onClick={() => router.push("/dashbord2")}
                className="w-full bg-gray-200 text-gray-700 py-2.5 rounded-lg font-medium text-sm hover:bg-gray-300 transition-colors duration-300"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      </div>

      <style jsx>{`
        .animate-fade-in {
          animation: fadeIn 0.5s ease-in;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @media (max-width: 576px) {
          .container {
            padding-left: 1rem;
            padding-right: 1rem;
          }
          .w-full {
            width: 100%;
          }
          button {
            width: 100%;
            margin-bottom: 0.5rem;
          }
        }
      `}</style>
    </NavbarProps>
  );
};

export default EditEntitesPage;
