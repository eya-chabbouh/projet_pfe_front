"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { ReactNode } from "react";
import Link from "next/link";
interface User {
  name: string;
  email: string;
  tel: string;
  photo?: string;
  role: "admin" | "proprietaire";
}
const Card = ({ title, value, description }: { title: string, value: number, description: string }) => {
    return (
        <div className="bg-white shadow-md rounded-lg p-6 w-full md:w-1/3 mb-6">
            <h3 className="text-xl font-semibold text-gray-700">{title}</h3>
            <p className="text-4xl font-bold text-indigo-600">{value}</p>
            <p className="text-gray-500">{description}</p>
        </div>
    );
};

const Dashboard = ({ children }: { children: ReactNode }) => {
    const [dashboardData, setDashboardData] = useState({
        reservations_count: 0,
        clients_count: 0,
        popular_services: [],
    });

    const router = useRouter();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://127.0.0.1:8000/api/profile", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        setUser(response.data); // Assurez-vous que l'API renvoie les données de l'utilisateur
      } catch (error) {
        console.error("Erreur lors de la récupération des données utilisateur:", error);
      }
    };
    fetchUserData();

    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://127.0.0.1:8000/api/prop/dashboard2", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        setDashboardData(response.data);
      } catch (error) {
        console.error("Erreur lors de la récupération des données", error);
      }
    };
    fetchDashboardData();
  }, []);
    const handleLogout = () => {
        localStorage.removeItem("token");
        router.push("/");
    };

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
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
                        <span>offres</span>
                    </Link>
                </li>
                <li className="nav-item">
                    <Link className="nav-link" href="/entites">
                        <i className="fas fa-list"></i>
                        <span>Entites</span>
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
                                   <button onClick={() => setMenuOpen(!menuOpen)} className="flex items-center space-x-2 focus:outline-none">
              <span className="text-gray-700">{user?.role === "admin" ? "Admin" : "Propriétaire"}</span>
              <img 
                src={user?.photo ? `http://127.0.0.1:8000/storage/${user.photo}` : '/default-avatar.png'} 
                alt="Profil" 
                className="rounded-full"   
                width={40} 
                height={40} 
              />
            </button>
                                </a>
                                <div className="dropdown-menu dropdown-menu-right shadow animated--grow-in"
                                    aria-labelledby="userDropdown">
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
                    <div className="container mx-auto px-4 py-8">
                        <h1 className="text-3xl font-bold text-gray-800 mb-6">Tableau de bord</h1>

                        {/* Statistiques */}
                        <div className="flex flex-wrap -mx-4">
                            <Card
                                title="Nombre de réservations"
                                value={dashboardData.reservations_count}
                                description="Total des réservations"
                            />
                            <Card
                                title="Nombre de clients"
                                value={dashboardData.clients_count}
                                description="Clients inscrits"
                            />
                        </div>

                        {/* Services populaires */}
                        {dashboardData.popular_services.length > 0 && (
                        <div className="mt-8">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Services populaires</h2>
                        <div className="bg-white shadow-md rounded-lg p-6">
                            <ul className="space-y-4">
                                {dashboardData.popular_services.map((service: any, index: number) => (
                                    <li key={index} className="flex flex-col md:flex-row justify-between items-start md:items-center">
                                        <div className="md:w-2/3">
                                           
                                        </div>
                    
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;

















