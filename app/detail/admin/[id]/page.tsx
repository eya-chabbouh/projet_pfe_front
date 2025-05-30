"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import AdminLayout from "@/app/components/AdminLayout/page";

interface AdminProfile {
  name: string;
  email: string;
  tel: string;
  photo?: string;
  role?: string;
}

const AdminDetailPage = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [navbarPhoto, setNavbarPhoto] = useState<string | null>(null); // Ajout d'une variable pour la photo de navbar

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`http://127.0.0.1:8000/api/detail/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setProfile(response.data);

        // Récupération de la photo de la navbar de l'admin
        const userProfileResponse = await axios.get("http://127.0.0.1:8000/api/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setNavbarPhoto(userProfileResponse.data.photo); // On définit la photo de navbar ici

      } catch (error) {
        console.error("Erreur lors du chargement du profil de l'admin :", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProfile();
  }, [id]);

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
        .profile-container {
          background-color: #f9fafb;
          border-radius: 10px;
          transition: transform 0.2s ease;
        }
        .profile-container:hover {
          transform: translateY(-2px);
        }
        .profile-img {
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
          <h3 className="text-center text-dark mb-4 fw-bold">Fiche de L'Admin</h3>
          {loading ? (
            <div className="d-flex justify-content-center align-items-center py-5">
              
              <span className="ms-2 text-secondary">Chargement...</span>
            </div>
          ) : !profile ? (
            <div className="text-center text-muted py-5">Aucun profil trouvé</div>
          ) : (
            <div className="mb-5 p-4 profile-container shadow-sm flex items-center space-x-6">
              {/* Image section */}
              <div className="w-32 h-32 flex-shrink-0">
                <img
                  src={profile.photo ? `http://127.0.0.1:8000/storage/${profile.photo}` : "/default-avatar.png"}
                  alt="Photo de profil"
                  className="w-full h-full rounded-full object-cover profile-img"
                />
              </div>

              {/* Information section */}
              <div className="flex-1 space-y-3">
                <div className="space-y-2">
                  <p>
                    <strong className="text-label">Nom :</strong>{" "}
                    <span className="text-value">{profile.name}</span>
                  </p>
                  <p>
                    <strong className="text-label">Email :</strong>{" "}
                    <span className="text-value">{profile.email}</span>
                  </p>
                  <p>
                    <strong className="text-label">Téléphone :</strong>{" "}
                    <span className="text-value">{profile.tel}</span>
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDetailPage;