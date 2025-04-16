"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import { useRouter } from 'next/navigation';
import axios from 'axios';

const EntitesPage = () => {
    const [entites, setEntites] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [proprietes, setProprietes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [selectedEntite, setSelectedEntite] = useState<number | null>(null);
    const [user, setUser] = useState<any | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [menuOpen, setMenuOpen] = useState(false);

    const router = useRouter();

    useEffect(() => {
        fetchData("entites", setEntites);
        fetchData("categories", setCategories);
        fetchData("proprietaires", setProprietes);
        fetchUserData();
    }, []);

    const fetchData = async (endpoint: string, setter: any) => {
        try {
            const res = await fetch(`http://localhost:8000/api/${endpoint}`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            if (!res.ok) throw new Error(`Erreur lors du chargement des ${endpoint}`);
            const data = await res.json();
            setter(data);
        } catch (error: any) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchUserData = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get("http://127.0.0.1:8000/api/profile", {
                headers: {
                    "Authorization": `Bearer ${token}`,
                }
            });
            setUser(response.data);
        } catch (error) {
            console.error("Erreur lors de la récupération des données utilisateur:", error);
        }
    };

    const handleDeleteClick = (id: number) => {
        setSelectedEntite(id);
        setShowModal(true);
    };

    const confirmDelete = async () => {
        if (selectedEntite) {
            try {
                const res = await fetch(`http://localhost:8000/api/entites/${selectedEntite}`, {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });

                if (res.ok) {
                    setEntites(entites.filter((entite) => entite.id !== selectedEntite));
                } else {
                    alert("Erreur lors de la suppression");
                }
            } catch (error) {
                alert("Erreur lors de la suppression");
            } finally {
                setShowModal(false);
            }
        }
    };

    const getCategoryName = (id: number) => {
        const category = categories.find((cat) => cat.id === id);
        return category ? category.nom : "Catégorie non trouvée";
    };

    const getProprieteName = (id: number) => {
        const propriete = proprietes.find((prop) => prop.id === id);
        return propriete ? propriete.nom : "Propriété non trouvée";
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        router.push("/login");
    };

    return (
        <div id="wrapper" className={isSidebarOpen ? "" : "toggled"}>
            {/* Sidebar */}
            <ul className="navbar-nav bg-gradient-primary sidebar sidebar-dark accordion" id="accordionSidebar">
                <a className="sidebar-brand d-flex align-items-center justify-content-center" href="/dashbord2">
                    <div className="sidebar-brand-text mx-3">Menu</div>
                </a>

                <hr className="sidebar-divider my-0" />
                <li className="nav-item">
                    <Link className="nav-link" href="/dashbord2">
                        <i className="fas fa-fw fa-tachometer-alt"></i>
                        <span>Tableau de Bord</span>
                    </Link>
                </li>
                <li className="nav-item">
                    <Link className="nav-link" href="/offres">
                        <i className="fas fa-users"></i>
                        <span>Offres</span>
                    </Link>
                </li>
                <li className="nav-item">
                    <Link className="nav-link" href="/entites">
                        <i className="fas fa-list"></i>
                        <span>Entités</span>
                    </Link>
                </li>
              
                <li className="nav-item">
                    <Link className="nav-link" href="/prop_profil">
                        <i className="fas fa-user"></i>
                        <span>Profil</span>
                    </Link>
                </li>
              
                <hr className="sidebar-divider d-none d-md-block" />
                <div className="text-center d-none d-md-inline">
                    <button className="rounded-circle border-0" onClick={() => setIsSidebarOpen(!isSidebarOpen)} id="sidebarToggle"></button>
                </div>
            </ul>

            {/* Content Wrapper */}
            <div id="content-wrapper" className="d-flex flex-column">
                <div id="content">
                    {/* Navbar */}
                    <nav className="navbar navbar-expand navbar-light bg-white topbar mb-4 static-top shadow">
                        <ul className="navbar-nav ml-auto">
                            <div className="topbar-divider d-none d-sm-block"></div>
                            <li className="nav-item dropdown no-arrow">
                                <a className="nav-link dropdown-toggle" href="#" id="userDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                    <button onClick={() => setMenuOpen(!menuOpen)} className="flex items-center space-x-2 focus:outline-none">
                                        <span className="text-gray-700">{user?.role === "admin" ? "Admin" : "Propriétaire"}</span>
                                        <img src={user?.photo ? `http://127.0.0.1:8000/storage/${user.photo}` : '/default-avatar.png'} alt="Profil" className="rounded-full" width={40} height={40} />
                                    </button>
                                </a>
                                <div className="dropdown-menu dropdown-menu-right shadow animated--grow-in" aria-labelledby="userDropdown">
                                    <a className="dropdown-item" href="/prop_profil">
                                        <i className="fas fa-user fa-sm fa-fw mr-2 text-gray-400"></i>Profil
                                    </a>
                                    <a className="dropdown-item" href="/prop_profil">
                                        <i className="fas fa-cogs fa-sm fa-fw mr-2 text-gray-400"></i>Paramètres
                                    </a>
                                    <div className="dropdown-divider"></div>

                                    <button className="dropdown-item" onClick={handleLogout}>
                                        <i className="fas fa-sign-out-alt fa-sm fa-fw mr-2 text-gray-400"></i>Déconnexion
                                    </button>
                                </div>
                            </li>
                        </ul>
                    </nav>

                    {/* Main Content */}
                    <div className="container mt-4">
                        <h2 className="text-center text-gray-800 text-2xl font-semibold mb-6">Liste des Entités Disponibles</h2>

                       {/*  <div className="flex justify-end mb-4">
                            <Link href="/entites/create-entites">
                                <button className="bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded-lg flex items-center gap-2">
                                    <FaPlus /> Ajouter une Entité
                                </button>
                            </Link>
                        </div> */}

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {entites
                                .filter((entite) => entite.status === "accepté") 
                            .map((entite) => (
                                <div key={entite.id} className="bg-white shadow-md rounded-lg p-5">
                                    {entite.image && (
                                        <img
                                            src={`http://127.0.0.1:8000/storage/${entite.image}`}
                                            alt={entite.nom_entites}
                                            className="w-full h-48 object-cover rounded-lg mb-4"
                                        />
                                    )}
                                    <h5 className="text-lg font-bold text-gray-900">{entite.nom_entites}</h5>
                                    <p className="text-gray-600">{entite.description}</p>
                                    <p className="text-sm text-gray-700"><strong>Localisation:</strong> {entite.localisation}</p>
                                    <p className="text-sm text-gray-700"><strong>Catégorie:</strong> {getCategoryName(entite.categ_id)}</p>
{/*                                     <p className="text-sm text-gray-700"><strong>Propriété:</strong> {getProprieteName(entite.prop_id)}</p>
 */}
                                    <div className="flex justify-between mt-4">
                                        <Link href={`/entites/edit-entites/${entite.id}`}>
                                            <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                                                <FaEdit /> Modifier
                                            </button>
                                        </Link>
                                        <button
                                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                                            onClick={() => handleDeleteClick(entite.id)}
                                        >
                                            <FaTrash /> Supprimer
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* MODAL DE CONFIRMATION */}
                        {showModal && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                                <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                                    <h3 className="text-xl font-bold text-gray-800 mb-4">Confirmer la suppression</h3>
                                    <p className="text-gray-600 mb-6">
                                        Êtes-vous sûr de vouloir supprimer cette entité ? Cette action est irréversible.
                                    </p>
                                    <div className="flex justify-end gap-3">
                                        <button
                                            className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg"
                                            onClick={() => setShowModal(false)}
                                        >
                                            Annuler
                                        </button>
                                        <button
                                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
                                            onClick={confirmDelete}
                                        >
                                            Supprimer
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EntitesPage;
