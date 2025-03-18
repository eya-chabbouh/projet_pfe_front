"use client";
import { ReactNode, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";

interface User {
  name: string;
  email: string;
  tel: string;
  photo?: string;
  role: "admin" | "proprietaire";
}

const AdminLayout = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

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
      <ul className={`navbar-nav bg-gradient-primary sidebar sidebar-dark accordion ${isSidebarOpen ? "" : "toggled"}`} id="accordionSidebar">
        <Link className="sidebar-brand d-flex align-items-center justify-content-center" href="/dashbord">
          <div className="sidebar-brand-text mx-3">Menu</div>
        </Link>

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
            <span>Proprietaire</span>
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

        {/* Toggle Sidebar */}
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

                {/* Dropdown menu */}
                {menuOpen && (
                  <div className="dropdown-menu dropdown-menu-right shadow animated--grow-in show">
                    <Link className="dropdown-item" href="/profile">
                      <i className="fas fa-user fa-sm fa-fw mr-2 text-gray-400"></i>
                      Profile
                    </Link>
                    <Link className="dropdown-item" href="/settings">
                      <i className="fas fa-cogs fa-sm fa-fw mr-2 text-gray-400"></i>
                      Paramètres
                    </Link>
                    <div className="dropdown-divider"></div>
                    <button className="dropdown-item" onClick={handleLogout}>
                      <i className="fas fa-sign-out-alt fa-sm fa-fw mr-2 text-gray-400"></i>
                      Déconnexion
                    </button>
                  </div>
                )}
              </li>
            </ul>
          </nav>

          {/* Page Content */}
          <div className="container-fluid">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
