"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import axios from "axios";
import { ReactNode } from "react";
import Link from "next/link";

export interface User {
    id: number;
    name: string;
    email: string;
    tel: string;
    photo?: string;
    role: "admin" | "proprietaire" | "client";
    is_active: boolean;
}

const UserList = ({ children }: { children: ReactNode }) => {
    const [demandes, setDemandes] = useState<any[]>([]);
const [showDemandes, setShowDemandes] = useState(false); // pour afficher ou masquer la liste

    const [users, setUsers] = useState<User[]>([]);
    const [search, setSearch] = useState("");
    const [role, setRole] = useState("");
    const [loading, setLoading] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [menuOpen, setMenuOpen] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [message, setMessage] = useState<string | null>(null); // ✅ message d'activation/désactivation
    const router = useRouter();
    const [showModal, setShowModal] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
    const [selectedIsActive, setSelectedIsActive] = useState<boolean>(false);
    useEffect(() => {
        const fetchUserData = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                router.push("/login");
                return;
            }
            try {
                const response = await axios.get("http://127.0.0.1:8000/api/profile", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setUser(response.data);
            } catch (error) {
                console.error("Erreur lors de la récupération des données utilisateur:", error);
            }
        };
        fetchUserData();
    }, [router]);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    useEffect(() => {
        fetchUsers();
    }, [search, role]);

    useEffect(() => {
        const fetchDemandes = async () => {
            const token = localStorage.getItem("token");
    
            try {
                const response = await axios.get("http://127.0.0.1:8000/api/admin/entites-attente", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setDemandes(response.data);
            } catch (error) {
                console.error("Erreur lors du chargement des demandes :", error);
            }
        };
    
            fetchDemandes();
        
    }, [user]);
    
    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await axios.get("http://127.0.0.1:8000/api/users", {
                params: { search, role },
            });
            setUsers(response.data);
        } catch (error) {
            console.error("Erreur lors de la récupération des utilisateurs", error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        router.push("/");
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
    };

    const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setRole(e.target.value);
    };

    const handleDeactivate = (userId: number, isActive: boolean) => {
        setSelectedUserId(userId);
        setSelectedIsActive(isActive);
        setShowModal(true); // ouvrir la modale
    };

    const handleAction = async (demandeId: number, accepter: boolean) => {
        const token = localStorage.getItem("token");
        const url = accepter
            ? `http://127.0.0.1:8000/api/admin/entites/${demandeId}/accepter`
            : `http://127.0.0.1:8000/api/admin/entites/${demandeId}/refuser`;
    
        try {
            await axios.put(url, {}, {
                headers: { Authorization: `Bearer ${token}` },
            });
    
            setDemandes((prev) => prev.filter((d) => d.id !== demandeId)); // retirer la demande de la liste
        } catch (error) {
            console.error("Erreur lors de la mise à jour de la demande :", error);
        }
    };
        
    const confirmDeactivation = async () => {
        if (selectedUserId === null) return;
        try {
            const response = await axios.put(`http://127.0.0.1:8000/api/users/${selectedUserId}/activation`);

            setUsers((prevUsers) =>
                prevUsers.map((user) =>
                    user.id === selectedUserId ? { ...user, is_active: !user.is_active } : user
                )
            );

            setMessage(response.data.message);
            setTimeout(() => setMessage(null), 3000);
        } catch (error) {
            console.error("Erreur lors de l'activation/désactivation de l'utilisateur", error);
            setMessage("Une erreur est survenue.");
        } finally {
            setShowModal(false); // fermer la modale
        }
    };

    const getRoleStyle = (role: string) => {
  switch (role.toLowerCase()) {
    case 'admin':
      return 'bg-red-100 text-red-600 border border-red-300';
    case 'client':
      return 'bg-blue-100 text-blue-600 border border-blue-300';
    case 'propriétaire':
    case 'proprietaire':
      return 'bg-green-100 text-green-600 border border-green-300';
    default:
      return 'bg-gray-100 text-gray-600 border border-gray-300';
  }
};

    return (
        <div id="wrapper" className={isSidebarOpen ? "" : "toggled"}>
            {/* Sidebar */}
            <ul className="navbar-nav bg-gradient-primary sidebar sidebar-dark accordion" id="accordionSidebar">
                <a className="sidebar-brand d-flex align-items-center justify-content-center" href="/dashbord">
                    <div className="sidebar-brand-text mx-3">Menu</div>
                </a>
                <hr className="sidebar-divider my-0" />
                <li className="nav-item">
                    <Link className="nav-link" href="/dashbord">
                        <i className="fas fa-fw fa-tachometer-alt"></i>
                        <span>Tableau de Bord</span>
                    </Link>
                </li>
                <li className="nav-item">
                    <Link className="nav-link" href="/users">
                        <i className="fas fa-users"></i>
                        <span>Utilisateurs</span>
                    </Link>
                </li>
                <li className="nav-item">
                    <Link className="nav-link" href="/categories">
                        <i className="fas fa-list"></i>
                        <span>Catégories</span>
                    </Link>
                </li>
                <li className="nav-item">
                    <Link className="nav-link" href="/admin">
                        <i className="fas fa-user"></i>
                        <span>Profil</span>
                    </Link>
                </li>
                
                <hr className="sidebar-divider d-none d-md-block" />
                <div className="text-center d-none d-md-inline">
                    <button className="rounded-circle border-0" onClick={toggleSidebar} id="sidebarToggle"></button>
                </div>
            </ul>

            {/* Content Wrapper */}
            <div id="content-wrapper" className="d-flex flex-column">
                <div id="content">                            
                    {/* Navbar */}
                    <nav className="navbar navbar-expand navbar-light bg-white topbar mb-4 static-top shadow">
                        <ul className="navbar-nav ml-auto">
                        <li className="nav-item dropdown no-arrow mx-2">
    <div className="relative">
        <button
            onClick={() => setShowDemandes(!showDemandes)}
            className="btn btn-light position-relative"
        >
            <i className="fas fa-bell fa-lg text-gray-600"></i>
            {demandes.length > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle">
                </span>
            )}
        </button>

        {showDemandes && (
            <div className="absolute right-0 z-10 bg-white shadow-lg rounded-lg p-4 w-80 mt-2">
                <h6 className="text-sm font-semibold mb-2">Demandes en attente</h6>
                {demandes.length === 0 ? (
                    <p className="text-gray-500 text-sm">Aucune demande.</p>
                ) : (
                    demandes.map((demande) => (
                        <div key={demande.id} className="border-b py-2">
                            <p className="text-sm font-medium">{demande.nom_entites} - {demande.email}</p>
                            <p className={`text-xs font-semibold mb-1 ${
                                demande.status === 'accepté' ? 'text-green-600' :
                                demande.status === 'refusé' ? 'text-red-600' : 'text-yellow-500'
                                }`}>
                                Statut : {demande.status}
                             </p>
                            <div className="flex justify-end space-x-2 mt-1">
                               
                                <button
                                    onClick={() => handleAction(demande.id, true)}
                                    className="text-green-600 text-xs"
                                >
                                    Accepter
                                </button>
                                <button
                                    onClick={() => handleAction(demande.id, false)}
                                    className="text-red-600 text-xs"
                                >
                                    Refuser
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        )}
    </div>
</li>

                            <div className="topbar-divider d-none d-sm-block"></div>
                            <li className="nav-item dropdown no-arrow">
                                <a className="nav-link dropdown-toggle" href="#" id="userDropdown" role="button"
                                    data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                    <button onClick={() => setMenuOpen(!menuOpen)} className="nav-link dropdown-toggle">
                                        <span className="text-gray-700">
                                            {user?.role === "admin" ? "Admin" : user?.role === "proprietaire" ? "Propriétaire" : "Client"}
                                        </span>
                                        <img
                                            src={user?.photo ? `http://127.0.0.1:8000/storage/${user.photo}` : "/default-avatar.png"}
                                            alt="Profil"
                                            className="rounded-full ml-2"
                                            width={40}
                                            height={40}
                                        />
                                    </button>
                                </a>
                                <div className="dropdown-menu dropdown-menu-right shadow animated--grow-in" aria-labelledby="userDropdown">
                                    <a className="dropdown-item" href="/admin">
                                        <i className="fas fa-user fa-sm fa-fw mr-2 text-gray-400"></i>Profil
                                    </a>
                                    <a className="dropdown-item" href="/admin">
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

                    {/* Page Content */}
                    <div className="container-fluid">{children}</div>

                    <div className="bg-white p-6 rounded-lg shadow-lg">
                        {/* ✅ Zone d'affichage des messages */}
                        {message && (
                            <div className="bg-green-100 text-green-800 px-4 py-2 rounded mb-4 border border-green-300">
                                {message}
                            </div>
                        )}

                        <div className="flex space-x-4 mb-4">
                            <input
                                type="text"
                                className="p-2 border border-gray-300 rounded-lg"
                                placeholder="Recherche par nom ou email"
                                value={search}
                                onChange={handleSearchChange}
                            />
                            <select className="p-2 border border-gray-300 rounded-lg" onChange={handleRoleChange} value={role}>
                                <option value="">Tous les rôles</option>
                                <option value="admin">Admin</option>
                                <option value="proprietaire">Propriétaire</option>
                                <option value="client">Client</option>
                            </select>
                        </div>

                        {loading ? (
                            <div className="text-center">Chargement...</div>
                        ) : (
                            <table className="w-full table-auto mt-4">
                                <thead className="bg-gray-200">
                                    <tr>
                                        <th className="px-4 py-2">ID</th>
                                        <th className="px-4 py-2">Nom</th>
                                        <th className="px-4 py-2">Email</th>
                                        <th className="px-4 py-2">Téléphone</th>
                                        <th className="px-4 py-2">Rôle</th>
                                        <th className="px-4 py-2">Statut</th>
                                        <th className="px-4 py-2">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user) => (
                                        <tr key={user.id} className="bg-white border-b hover:bg-gray-50">
                                            <td className="px-4 py-2">{user.id}</td>
                                            <td className="px-4 py-2">{user.name}</td>
                                            <td className="px-4 py-2">{user.email}</td>
                                            <td className="px-4 py-2">{user.tel}</td>
                                            <td className="px-4 py-2"> 
                                            <span className={`px-2 py-1 rounded text-sm font-semibold ${getRoleStyle(user.role)}`}>
                                            {user.role === 'proprietaire' ? 'Propriétaire' : user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                            </span>
                                             </td>
                                            <td className="px-4 py-2">{user.is_active ? "Inactif" : "Actif"}</td>
                                            <td className="px-4 py-2 flex gap-2">
                                                <button 
                                                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded flex items-center gap-2"
                                                    onClick={() => router.push(`/modifier/${user.id}`)}
                                                >
                                                    <i className="fas fa-edit"></i>
                                                </button>
                                                <button 
                                                    className={`px-3 py-1 rounded flex items-center gap-2 ${user.is_active ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'} text-white`}
                                                    onClick={() => handleDeactivate(user.id, user.is_active)}
                                                >
                                                    <i className="fas fa-power-off"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                    {/* ✅ MODALE DE CONFIRMATION */}
                    {showModal && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                            <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
                                <h2 className="text-lg font-bold mb-4">
                                    {selectedIsActive ? "Activer" : "Désactiver"} cet utilisateur ?
                                </h2>
                                <p className="mb-6 text-gray-600">
                                    Êtes-vous sûr de vouloir {selectedIsActive ? "activer" : "désactiver"} cet utilisateur ?
                                </p>
                                <div className="flex justify-end gap-3">
                                    <button
                                        onClick={() => setShowModal(false)}
                                        className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 text-gray-800"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        onClick={confirmDeactivation}
                                        className={`px-4 py-2 rounded ${selectedIsActive ? "bg-red-600 hover:bg-green-700" : "bg-green-600 hover:bg-red-700"} text-white`}
                                    >
                                        Confirmer
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserList;



























