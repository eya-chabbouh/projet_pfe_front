"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import { useRouter } from "next/navigation";
import AdminLayout from "@/app/components/AdminLayout/page";

interface ClientProfile {
  name: string;
  email: string;
  tel: string;
  photo?: string;
  ville?: string;
  gouvernement?: string;
  genre?: string;
  role?: string;
}

const ClientDetailPage = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState<ClientProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`http://127.0.0.1:8000/api/client/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setProfile(response.data);
      } catch (error) {
        console.error("Erreur lors du chargement du profil client :", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://127.0.0.1:8000/api/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUser(response.data);
      } catch (error) {
        console.error("Erreur lors du chargement de l'utilisateur connecté :", error);
      }
    };

    if (id) {
      fetchProfile();
      fetchUserData();
    }
  }, [id]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".nav-item.dropdown")) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/");
  };

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      
      <span className="ms-2 text-secondary">Chargement...</span>
    </div>
  );
  if (!profile) return (
    <div className="text-center mt-10 text-muted py-5">
      Aucun profil trouvé
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
        <div className="max-w-3xl mx-auto p-6 bg-white card-modern shadow-sm fade-in">
          <h2 className="text-center text-2xl font-bold text-dark mb-6">Fiche Client</h2>
          <div className="flex flex-col md:flex-row gap-6 items-center">
            {/* Photo */}
            <div className="w-28 h-28 flex-shrink-0">
              {profile.photo ? (
                <img
                  src={`http://127.0.0.1:8000/storage/${profile.photo}`}
                  alt="Photo client"
                  className="w-full h-full rounded-full object-cover profile-img"
                />
              ) : (
                <img
                  src="/default-avatar.png"
                  alt="Photo par défaut"
                  className="w-full h-full rounded-full object-cover profile-img"
                />
              )}
            </div>

            {/* Infos */}
            <div className="flex-1 space-y-3">
              <p>
                <strong className="text-label">Nom :</strong>{" "}
                <span className="text-value">{profile.name || "N/A"}</span>
              </p>
              <p>
                <strong className="text-label">Email :</strong>{" "}
                <span className="text-value">{profile.email || "N/A"}</span>
              </p>
              <p>
                <strong className="text-label">Téléphone :</strong>{" "}
                <span className="text-value">{profile.tel || "N/A"}</span>
              </p>
              <p>
                <strong className="text-label">Ville :</strong>{" "}
                <span className="text-value">{profile.ville || "N/A"}</span>
              </p>
              <p>
                <strong className="text-label">Gouvernement :</strong>{" "}
                <span className="text-value">{profile.gouvernement || "N/A"}</span>
              </p>
              <p>
                <strong className="text-label">Genre :</strong>{" "}
                <span className="text-value">{profile.genre || "N/A"}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ClientDetailPage;