"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "next/navigation";
import { FaUserEdit } from "react-icons/fa";

const EditUserPage = () => {
    const { id } = useParams();
    const [userField, setUserField] = useState({
        name: "",
        email: "",
        role: "",
        tel: "",
        photo: null,
    });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUser();
    }, [id]);

    const fetchUser = async () => {
        try {
            const response = await axios.get(`http://127.0.0.1:8000/api/users/${id}`);
            console.log("Réponse de l'API :", response.data);
            setUserField(response.data);
        } catch (err) {
            console.error("Erreur lors de la récupération des données", err);
            alert("Impossible de récupérer les données de l'utilisateur.");
        } finally {
            setLoading(false);
        }
    };

    const changeUserFieldHandler = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setUserField({
            ...userField,
            [e.target.name]: e.target.value,
        });
    };

   /* const changePhotoHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setUserField({ ...userField, photo: e.target.files[0] });
        }
    };*/

    const onSubmitChange = async (e: React.FormEvent) => {
        e.preventDefault();
    
        const formData = new FormData();
        formData.append("_method", "PUT"); 
        formData.append("name", userField.name);
        formData.append("email", userField.email);
        formData.append("role", userField.role);
        formData.append("tel", userField.tel);
    
        try {
            await axios.post(`http://127.0.0.1:8000/api/users/${id}`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            window.location.href = "/users";
        } catch (err) {
            console.error("Erreur lors de la mise à jour", err);
            alert("Erreur lors de la mise à jour de l'utilisateur.");
        }
    };
    

    if (loading) return <div className="text-center text-gray-500 mt-10">Chargement...</div>;
    if (error) return <div className="text-center text-red-500 mt-10">{error}</div>;

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-lg">
                <h1 className="text-2xl font-semibold text-center text-gray-800 flex items-center justify-center gap-2">
                    <FaUserEdit className="text-blue-600" />
                    Modifier Utilisateur
                </h1>
                <form onSubmit={onSubmitChange} encType="multipart/form-data" className="mt-4 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nom</label>
                        <input
                            type="text"
                            name="name"
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Nom complet"
                            value={userField.name}
                            onChange={changeUserFieldHandler}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            name="email"
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Email"
                            value={userField.email}
                            onChange={changeUserFieldHandler}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Rôle</label>
                        <select
                            name="role"
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={userField.role}
                            onChange={changeUserFieldHandler}
                        >
                            <option value="admin">Admin</option>
                            <option value="client">Client</option>
                            <option value="proprietaire">Propriétaire</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Téléphone</label>
                        <input
                            type="text"
                            name="tel"
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Numéro de téléphone"
                            value={userField.tel}
                            onChange={changeUserFieldHandler}
                        />
                    </div>

                   {/*  <div>
                        <label className="block text-sm font-medium text-gray-700">Photo</label>
                        <input
                            type="file"
                            name="photo"
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            onChange={changePhotoHandler}
                        />
                        {userField.photo && typeof userField.photo === "string" && (
                            <div className="mt-2 flex items-center">
                                <img
                                    src={userField.photo}
                                    alt="Photo de profil"
                                    className="rounded-full w-16 h-16 object-cover border"
                                />
                                <span className="ml-3 text-sm text-gray-600">Image actuelle</span>
                            </div>
                        )}
                    </div>
 */}
                    <button type="submit" className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition">
                        Mettre à jour
                    </button>
                    <button type="submit" className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition">
                        Annuler 
                    </button>
                </form>
            </div>
        </div>
    );
};

export default EditUserPage;
