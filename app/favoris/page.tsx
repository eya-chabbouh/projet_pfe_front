"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { useRouter } from "next/navigation"
import { Heart, MapPin, Loader2, Star } from "lucide-react"
import Navbar from "../components/Navbar"

interface Entity {
  id: number
  entite: {
    id: number
    nom_entites: string
    description: string
    image: string
    localisation: string
    image_url: string
  }
}

interface Offer {
  id: number
  titre: string
  description: string
  prix_reduit: number
  reduction: number
  entite_id: number
}

export default function FavoritesPage() {
  const [favoriteEntities, setFavoriteEntities] = useState<Entity[]>([])
  const [offers, setOffers] = useState<Offer[]>([])
  const [user, setUser] = useState<any>({})
  const [isLoading, setIsLoading] = useState(true)
  const [removingId, setRemovingId] = useState<number | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const token = localStorage.getItem("token")
        if (!token) {
          router.push("/login")
          return
        }

        // Récupérer les favoris, les offres et le profil utilisateur
        const [favRes, offersRes, userRes] = await Promise.all([
          axios.get<Entity[]>("http://127.0.0.1:8000/api/favoris", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get<Offer[]>("http://127.0.0.1:8000/api/offres", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://127.0.0.1:8000/api/client/profile", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ])

        setFavoriteEntities(favRes.data)
        setOffers(offersRes.data)
        setUser(userRes.data)
      } catch (error) {
        console.error("Erreur lors du chargement des données", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [router])

  const handleFavoriteRemove = async (entityId: number) => {
    try {
      setRemovingId(entityId)
      const token = localStorage.getItem("token")
      if (!token) return

      await axios.delete(`http://127.0.0.1:8000/api/favoris/${entityId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      setFavoriteEntities((prev) => prev.filter((ent) => ent.id !== entityId))
    } catch (error) {
      console.error("Erreur suppression favoris", error)
    } finally {
      setRemovingId(null)
    }
  }

  // Fonction pour obtenir l'offre avec la meilleure réduction pour une entité
  const getOfferForEntity = (entityId: number) => {
    const entityOffers = offers.filter((off) => off.entite_id === entityId)
    return entityOffers.sort((a, b) => b.reduction - a.reduction)[0]
  }

  const getImageSrc = (entity: Entity) => {
    if (entity.entite.image_url) {
      return entity.entite.image_url
    }
    if (entity.entite.image) {
      return entity.entite.image.startsWith("http")
        ? entity.entite.image
        : `http://127.0.0.1:8000/storage/${entity.entite.image}`
    }
    return "/placeholder.svg?height=200&width=300"
  }

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50">
          <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col items-center justify-center h-64">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-4" />
              <p className="text-gray-600">Chargement de vos favoris...</p>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* En-tête */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-red-500" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Mes Favoris</h1>
            </div>
            <p className="text-gray-600">
              {favoriteEntities.length > 0
                ? `Vous avez ${favoriteEntities.length} service${favoriteEntities.length > 1 ? "s" : ""} en favoris`
                : "Aucun service en favoris pour le moment"}
            </p>
          </div>

          {/* Contenu */}
          {favoriteEntities.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun favori</h3>
              <p className="text-gray-600 mb-6">Vous n'avez pas encore ajouté de services à vos favoris.</p>
              <button
                onClick={() => router.push("/")}
                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Découvrir les services
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {favoriteEntities.map((entity) => {
                const offer = getOfferForEntity(entity.entite.id) // Récupérer l'offre pour l'entité
                return (
                  <div
                    key={entity.id}
                    className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200 cursor-pointer group"
                    onClick={() => router.push(`/offre_client?id=${entity.entite.id}`)}
                  >
                    {/* Image */}
                    <div className="relative overflow-hidden">
                      <img
                        src={getImageSrc(entity) || "/placeholder.svg"}
                        alt={entity.entite.nom_entites}
                        className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = "/placeholder.svg?height=200&width=300"
                        }}
                      />

                      {/* Bouton de suppression */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleFavoriteRemove(entity.id)
                        }}
                        disabled={removingId === entity.id}
                        className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-sm hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-300 disabled:opacity-50"
                        aria-label={`Supprimer ${entity.entite.nom_entites} des favoris`}
                      >
                        {removingId === entity.id ? (
                          <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                        ) : (
                          <Heart className="w-4 h-4 text-red-500 fill-current" />
                        )}
                      </button>

                      {/* Badge de réduction (si disponible) */}
                      {offer && (
                        <div className="absolute top-3 left-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                          -{offer.reduction}%
                        </div>
                      )}
                    </div>

                    {/* Contenu */}
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
                        {entity.entite.nom_entites}
                      </h3>

                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{entity.entite.description}</p>

                      <div className="flex items-center gap-1 text-gray-500 text-sm">
                        <MapPin className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{entity.entite.localisation}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Message d'encouragement si peu de favoris */}
          {favoriteEntities.length > 0 && favoriteEntities.length < 3 && (
            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Star className="w-5 h-5 text-blue-500" />
                <div>
                  <h4 className="font-medium text-blue-900">Découvrez plus de services</h4>
                  <p className="text-sm text-blue-700">
                    Explorez notre catalogue pour trouver d'autres services qui pourraient vous intéresser.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}