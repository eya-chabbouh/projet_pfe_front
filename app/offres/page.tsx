"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaPlus, FaEdit, FaTrashAlt, FaSearch } from "react-icons/fa";

const OffresPage = () => {
  const [offres, setOffres] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [offerToDelete, setOfferToDelete] = useState<number | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filteredOffres, setFilteredOffres] = useState<any[]>([]);

  // Fetching the offres
  const fetchOffres = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/offres", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setOffres(response.data);
      setFilteredOffres(response.data);
      setLoading(false);
    } catch (err) {
      setError("Erreur de récupération des offres");
      setLoading(false);
    }
  };

  // Delete an offre
  const deleteOffre = async () => {
    if (offerToDelete === null) return;

    try {
      await axios.delete(`http://localhost:8000/api/offres/${offerToDelete}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const updatedOffres = offres.filter((offre) => offre.id !== offerToDelete);
      setOffres(updatedOffres);
      setFilteredOffres(updatedOffres);
      setShowModal(false);
    } catch (error) {
      setError("Erreur lors de la suppression de l'offre");
      setShowModal(false); // Close modal in case of error
    }
  };

  // Handle delete confirmation modal
  const handleDeleteClick = (id: number) => {
    setOfferToDelete(id);
    setShowModal(true); // Show confirmation modal
  };

  // Fetch user data
  useEffect(() => {
    fetchOffres();
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://127.0.0.1:8000/api/profile", {
        headers: { "Authorization": `Bearer ${token}` },
      });
      setUser(response.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des données utilisateur:", error);
    }
  };

  // Filter offres based on search query
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    const filtered = offres.filter((offre) =>
      (offre.titre?.toLowerCase() ?? "").includes(query) ||
      (offre.prix_reduit?.toString() ?? "").includes(query) ||
      (offre.reduction?.toString() ?? "").includes(query)
    );

    setFilteredOffres(filtered);
  };

  if (error) return <div>{error}</div>;

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
                    <img src={user?.photo ? `http://127.0.0.1:8000/storage/${user.photo}` : '/default-avatar.png'} alt="Profil" className="rounded-circle" width={40} height={40} />
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

                  <button className="dropdown-item" onClick={() => {
                    localStorage.removeItem("token");
                    router.push("/login");
                  }}>
                    <i className="fas fa-sign-out-alt fa-sm fa-fw mr-2 text-gray-400"></i>Déconnexion
                  </button>
                </div>
              </li>
            </ul>
          </nav>

          {/* Main Content */}
          <div className="container-fluid mt-4" style={{ maxWidth: "1200px" }}>
            <h1 className="mb-4">Liste des Offres</h1>

            {/* Search Input and Button */}
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div className="d-flex w-75">
                <input
                  type="text"
                  className="form-control me-2"
                  placeholder="Rechercher par titre, prix ou réduction..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  style={{ flex: 1 }}
                />
                <FaSearch className="ms-2" />
              </div>

              {/* Button "Ajouter" */}
              <div>
                <Link href="/offres/create-offre">
                  <button className="btn btn-success">
                    <FaPlus /> Ajouter
                  </button>
                </Link>
              </div>
            </div>

            {/* Table of offres */}
            <div className="table-responsive">
              <table className="table table-striped table-bordered" style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th style={{ width: '10%' }}>Titre</th>
                    <th style={{ width: '15%' }}>Description</th>
                    <th style={{ width: '10%' }}>Prix</th>
                    <th style={{ width: '10%' }}>Réduction</th>
                    <th style={{ width: '10%' }}>Date de début</th>
                    <th style={{ width: '10%' }}>Date de fin</th>
                    <th style={{ width: '15%' }}>Image</th>
                    <th style={{ width: '10%' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOffres.map((offre) => (
                    <tr key={offre.id}>
                      <td>{offre.titre}</td>
                      <td>{offre.description}</td>
                      <td>{offre.prix_reduit} DT</td>
                      <td>{offre.reduction} %</td>
                      <td>{offre.date_debut}</td>
                      <td>{offre.date_fin}</td>
                      <td>
                        <img
                          src={offre.image ? `http://127.0.0.1:8000/storage/${offre.image}` : "/default-image.png"}
                          alt="Offre"
                          width={100}
                          height={60}
                          style={{ objectFit: "cover", borderRadius: "5px" }}
                        />
                      </td>
                      <td>
                        <Link href={`/offres/edit-offre/${offre.id}`}>
                          <button className="btn btn-primary">
                            <FaEdit />
                          </button>
                        </Link>
                        <button
                          className="btn btn-danger ms-2"
                          onClick={() => handleDeleteClick(offre.id)}
                        >
                          <FaTrashAlt />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Modal de confirmation */}
            <div
              className={`modal fade ${showModal ? "show" : ""}`}
              tabIndex={-1}
              aria-labelledby="deleteModalLabel"
              aria-hidden={!showModal}
              style={{ display: showModal ? "block" : "none" }}
            >
              <div className="modal-dialog">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title" id="deleteModalLabel">Confirmer la suppression</h5>
                    <button
                      type="button"
                      className="btn-close"
                      data-bs-dismiss="modal"
                      aria-label="Close"
                      onClick={() => setShowModal(false)}
                    ></button>
                  </div>
                  <div className="modal-body">
                    Voulez-vous vraiment supprimer l'offre ?
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      data-bs-dismiss="modal"
                      onClick={() => setShowModal(false)}
                    >
                      Annuler
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={deleteOffre}
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OffresPage;
