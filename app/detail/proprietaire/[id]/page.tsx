"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import AdminLayout from "@/app/components/AdminLayout/page";

export default function DetailProprietaire() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [entites, setEntites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/");
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const userRes = await axios.get(`http://localhost:8000/api/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(userRes.data);

        const entitesRes = await axios.get(`http://localhost:8000/api/users/${id}/entites`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEntites(entitesRes.data);

        const profileRes = await axios.get("http://localhost:8000/api/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(profileRes.data);
      } catch (error) {
        console.error("Erreur de chargement :", error);
        if (!token) router.push("/login");
      } finally {
        setLoading(false);
      }
    }

    if (id && token) {
      fetchData();
    }
  }, [id, token, router]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".nav-item.dropdown")) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      
      <span className="ms-2 text-secondary">Chargement...</span>
    </div>
  );
  if (!user) return (
    <div className="text-center mt-10 text-muted">
      Aucune donnée trouvée.
    </div>
  );

  return (
    <AdminLayout>
      <style jsx>{`
        .fade-in {
          animation: fadeIn 0.6s ease-out;
        }
        .card-modern {
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          transition: box-shadow 0.3s ease;
        }
        .card-modern:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        .entity-card {
          background-color: #f9fafb;
          border-radius: 10px;
          transition: transform 0.2s ease;
        }
        .entity-card:hover {
          transform: translateY(-2px);
        }
        .entity-img {
          border: 3px solid #e5e7eb;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        .text-label {
          color: #1f2937;
          font-weight: 600;
        }
        .text-value {
          color: #4b5563;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
      {/* Main Content */}
      <div className="container mx-auto p-6">
        <div className="card card-modern p-5 shadow-sm bg-white fade-in">
          <h3 className="text-center text-dark mb-5 fw-bold">Fiche Propriétaire</h3>

          <div>
            {entites.length === 0 ? (
              <p className="text-center text-muted py-5">Aucune entité associée à ce propriétaire.</p>
            ) : (
              entites.map((entite, index) => (
                <div key={index} className="mb-5 p-4 entity-card shadow-sm fade-in">
                  <div className="flex items-center space-x-6">
                    {entite.image && (
                      <div className="w-24 h-24 flex-shrink-0">
                        <img
                          src={`http://localhost:8000/storage/${entite.image}`}
                          alt={`Logo de ${entite.nom_entites}`}
                          className="w-full h-full rounded-full object-cover entity-img"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <h5 className="text-primary mb-2 text-label">{entite.nom_entites}</h5>
                      <p>
                        <strong className="text-label">Description :</strong>{" "}
                        <span className="text-value">{entite.description || "N/A"}</span>
                      </p>
                      <p>
                        <strong className="text-label">Localisation :</strong>{" "}
                        <span className="text-value">{entite.localisation || "N/A"}</span>
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p>
                      <strong className="text-label">Nom du Propriétaire :</strong>{" "}
                      <span className="text-value">{user.name}</span>
                    </p>
                    <p>
                      <strong className="text-label">Email :</strong>{" "}
                      <span className="text-value">{user.email}</span>
                    </p>
                    <p>
                      <strong className="text-label">Téléphone :</strong>{" "}
                      <span className="text-value">{user.tel}</span>
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}