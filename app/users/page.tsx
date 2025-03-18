"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import axios from "axios";
import { User } from "./types";
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
    const [users, setUsers] = useState<User[]>([]);
    const [search, setSearch] = useState("");
    const [role, setRole] = useState("");
    const [loading, setLoading] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [menuOpen, setMenuOpen] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const router = useRouter();

    
    useEffect(() => {
        const fetchUserData = async () => {
          try {
            const token = localStorage.getItem("token");
            if (!token) {
              router.push("/login");
              return;
            }
            const response = await axios.get("http://127.0.0.1:8000/api/profile", {
              headers: {
                Authorization: `Bearer ${token}`,
              },
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

    const handleDeactivate = async (userId: number, isActive: boolean) => {
        const confirmMessage = isActive 
            ? "Êtes-vous sûr de vouloir désactiver cet utilisateur ?" 
            : "Êtes-vous sûr de vouloir activer cet utilisateur ?";
        
        if (!window.confirm(confirmMessage)) {
            return;
        }

        try {
            const response = await axios.put(`http://127.0.0.1:8000/api/users/${userId}/activation`);
            
            setUsers((prevUsers) =>
                prevUsers.map((user) =>
                    user.id === userId ? { ...user, is_active: !user.is_active } : user
                )
            );

            alert(response.data.message);
        } catch (error) {
            console.error("Erreur lors de l'activation/désactivation de l'utilisateur", error);
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
          <Link className="nav-link" href="/proprietaires">
            <i className="fas fa-list"></i>
            <span>Proprietaires</span>
          </Link>
        </li>
                <li className="nav-item">
                    <Link className="nav-link" href="/profile">
                        <i className="fas fa-user"></i>
                        <span>Profile</span>
                    </Link>
                </li>
                <li className="nav-item">
                    <Link className="nav-link" href="/settings">
                        <i className="fas fa-cog"></i>
                        <span>Paramètres</span>
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
                            <div className="topbar-divider d-none d-sm-block"></div>
                            <li className="nav-item dropdown no-arrow">
                                <a className="nav-link dropdown-toggle" href="#" id="userDropdown" role="button"
                                    data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                    <button onClick={() => setMenuOpen(!menuOpen)} className="nav-link dropdown-toggle">
                  <span className="text-gray-700">
                    {user?.role === "admin" ? "Admin" : user?.role === "proprietaire" ? "Propriétaire" : "Admin"}
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
                                <div className="dropdown-menu dropdown-menu-right shadow animated--grow-in"
                                    aria-labelledby="userDropdown">

                                 <a className="dropdown-item" href="/profile">
                                 <i className="fas fa-user fa-sm fa-fw mr-2 text-gray-400"></i>Profile
                                 </a>
                                 <a className="dropdown-item" href="#">
                                 <i className="fas fa-cogs fa-sm fa-fw mr-2 text-gray-400"></i>Settings
                                 </a>

                                 <button className="dropdown-item" onClick={handleLogout}>
                                    <i className="fas fa-sign-out-alt fa-sm fa-fw mr-2 text-gray-400"></i>Logout
                                </button>   
                                </div>
                            </li>
                        </ul>
                    </nav>

                    {/* Page Content */}
                    <div className="container-fluid">{children}</div>

                    {/* Main Content */}
                    <div className="bg-white p-6 rounded-lg shadow-lg">
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
                                            <td className="px-4 py-2">{user.role}</td>
                                            <td className="px-4 py-2">{user.is_active ? "Inactif" : "Actif"}</td>
                                                <td className="px-4 py-2 flex gap-2">
                                                {/* Bouton Modifier */}
                                                <button 
                                                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded flex items-center gap-2"
                                                    onClick={() => router.push(`/modifier/${user.id}`)}
                                                >
                                                    <i className="fas fa-edit"></i> 
                                                </button>

                                                {/* Bouton Activer/Désactiver */}
                                                <button 
                                                    className={`px-3 py-1 rounded flex items-center gap-2 ${user.is_active ? 'bg-red-500 hover:bg-green-600' : 'bg-green-500 hover:bg-red-600'} text-white`}
                                                    onClick={() => handleDeactivate(user.id, user.is_active)}
                                                >
                                                    <i className="fas fa-power-off"></i> 
                                                    {user.is_active ? "" : ""}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserList;

