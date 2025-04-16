"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Define an interface for category
interface Category {
  id: number;
  nom: string;
  image?: string; // Optional image property
}

const CategoriesPage = () => {
  const [categories, setCategories] = useState<Category[]>([]); // Set the state type to Category[]
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // State for sidebar toggle
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  // Fetch categories from the API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          window.location.href = "/login"; // Redirect if not logged in
          return;
        }
        const response = await axios.get("http://127.0.0.1:8000/api/categories", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setCategories(response.data);
      } catch (error) {
        console.error("Error fetching categories", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Fetch user data
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
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [router]);

  // Handle search term change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Filter categories based on search term
  const filteredCategories = categories.filter(
    (category) =>
      category.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.image?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Delete category
  const deleteCategory = async (id: number) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        window.location.href = "/login"; // Redirect if not logged in
        return;
      }
      await axios.delete(`http://127.0.0.1:8000/api/categories/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCategories(categories.filter((category: Category) => category.id !== id)); // Remove from list
      setShowDeleteDialog(false); // Close dialog
    } catch (error) {
      console.error("Error deleting category", error);
    }
  };

  // Toggle sidebar visibility
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
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

        {/* Sidebar Toggle Button */}
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
                <a className="nav-link dropdown-toggle" href="#" id="userDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                  {user?.role === "admin" ? "Admin" : user?.role === "proprietaire" ? "Propriétaire" : "Admin"}
                  <img
                    src={user?.photo ? `http://127.0.0.1:8000/storage/${user.photo}` : "/default-avatar.png"}
                    alt="Profil"
                    className="rounded-full ml-2"
                    width={40}
                    height={40}
                  />
                </a>
                <div className="dropdown-menu dropdown-menu-right shadow animated--grow-in" aria-labelledby="userDropdown">
                <a className="dropdown-item" href="/admin">
                                        <i className="fas fa-user fa-sm fa-fw mr-2 text-gray-400"></i>Profil
                                    </a>
                                    <a className="dropdown-item" href="/admin">
                                        <i className="fas fa-cogs fa-sm fa-fw mr-2 text-gray-400"></i>Paramètres
                                    </a>
                                    <div className="dropdown-divider"></div>

                  <button className="dropdown-item" onClick={() => { localStorage.removeItem("token"); router.push("/"); }}>
                  <i className="fas fa-sign-out-alt fa-sm fa-fw mr-2 text-gray-400"></i>Déconnexion
                  </button>
                </div>
              </li>
            </ul>
          </nav>

          {/* Page Content */}
          <div className="container-fluid">
            <h1 className="h3 mb-4 text-gray-800">Gestion des Catégories</h1>

            {/* Search Bar */}
            <div className="mb-4">
              <input
                type="text"
                className="form-control"
                placeholder="Rechercher une catégorie..."
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>

            {/* Categories List */}
            <div className="card shadow mb-4">
              <div className="card-header py-3">
                <h6 className="m-0 font-weight-bold text-primary">Liste des Catégories</h6>
              </div>
              <div className="card-body">
                <table className="table table-bordered">
                  <thead>
                    <tr>
                      <th>Nom</th>
                      <th>Image</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCategories.map((category) => (
                      <tr key={category.id}>
                        <td>{category.nom}</td>
                        <td>
                          {category.image && (
                            <img
                              src={`http://127.0.0.1:8000/storage/${category.image}`}
                              alt={category.nom}
                              style={{ width: "50px", height: "50px", borderRadius: "5px" }}
                            />
                          )}
                        </td>
                        <td>
                          <Link href={`/categories/edit-categ/${category.id}`} className="btn btn-warning btn-sm">
                            <i className="fas fa-edit"></i> 
                          </Link>
                          <button
                            className="btn btn-danger btn-sm ml-2"
                            onClick={() => {
                              setCategoryToDelete(category.id);
                              setShowDeleteDialog(true);
                            }}
                          >
                            <i className="fas fa-trash-alt"></i> 
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Add New Category Button */}
                <Link href="/categories/create-categ" className="btn btn-primary">
                  <i className="fas fa-plus"></i> Ajouter une catégorie
                </Link>
              </div>
            </div>

            {/* Delete Confirmation Dialog */}
            {showDeleteDialog && (
              <div className="modal fade show" style={{ display: "block" }} tabIndex={-1} role="dialog">
                <div className="modal-dialog" role="document">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title">Confirmer la suppression</h5>
                      <button
                        type="button"
                        className="close"
                        onClick={() => setShowDeleteDialog(false)}
                        aria-label="Close"
                      >
                        <span aria-hidden="true">&times;</span>
                      </button>
                    </div>
                    <div className="modal-body">
                      <p>Êtes-vous sûr de vouloir supprimer cette catégorie ?</p>
                    </div>
                    <div className="modal-footer">
                      <button type="button" className="btn btn-secondary" onClick={() => setShowDeleteDialog(false)}>
                        Annuler
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger"
                        onClick={() => categoryToDelete && deleteCategory(categoryToDelete)}
                      >
                        Supprimer
                      </button>
                    </div>
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

export default CategoriesPage;
