"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function RegisterPrestatairePage() {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // État global du formulaire (user + entité)
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    nom_entites: '',
    description: '',
    localisation: '',
    categ_id: '',
  });
  const [image, setImage] = useState<File | null>(null);

  // Charger les catégories
  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch('http://localhost:8000/api/public/categories');
        if (!res.ok) throw new Error('Erreur chargement catégories');
        setCategories(await res.json());
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchCategories();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setImage(e.target.files[0]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const data = new FormData();
    // champs user
    data.append('name', form.name);
    data.append('email', form.email);
    data.append('password', form.password);
    data.append('password_confirmation', form.password_confirmation);
    // champs entité
    data.append('nom_entites', form.nom_entites);
    data.append('description', form.description);
    data.append('localisation', form.localisation);
    data.append('categ_id', form.categ_id);
    if (image) data.append('image', image);

    try {
      const res = await axios.post(
        'http://localhost:8000/api/entites',
        data,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      setSuccessMessage(res.data.message);
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
    }
  };

  if (loading) return <div>Chargement...</div>;
  if (error) return <div className="text-red-600">Erreur : {error}</div>;

  return (
    <div className="max-w-lg mx-auto mt-8 p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-bold mb-4 text-center">Inscription Prestataire</h1>

      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 text-green-800 rounded">
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} encType="multipart/form-data">
        {/* -- Infos Utilisateur -- */}
        <div className="mb-3">
          <label className="block font-semibold mb-1">Nom complet</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
        </div>

        <div className="mb-3">
          <label className="block font-semibold mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-3">
          <div>
            <label className="block font-semibold mb-1">Mot de passe</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Confirmer mot de passe</label>
            <input
              type="password"
              name="password_confirmation"
              value={form.password_confirmation}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded"
            />
          </div>
        </div>

        {/* -- Infos Entité -- */}
        <div className="mb-3">
          <label className="block font-semibold mb-1">Nom de l'entité</label>
          <input
            type="text"
            name="nom_entites"
            value={form.nom_entites}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
        </div>

        <div className="mb-3">
          <label className="block font-semibold mb-1">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
        </div>

        <div className="mb-3">
          <label className="block font-semibold mb-1">Localisation</label>
          <input
            type="text"
            name="localisation"
            value={form.localisation}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
        </div>

        <div className="mb-3">
          <label className="block font-semibold mb-1">Catégorie</label>
          <select
            name="categ_id"
            value={form.categ_id}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          >
            <option value="">-- Sélectionner --</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.nom}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block font-semibold mb-1">Image (optionnelle)</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full"
          />
        </div>

        <button
          type="submit"
          className="w-full py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700"
        >
          S’inscrire et créer l’entité
        </button>
      </form>
    </div>
  );
}
