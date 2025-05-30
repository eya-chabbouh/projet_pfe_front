"use client"
import { useEffect, useState } from "react"
import type React from "react"

import Link from "next/link"
import { Search, Star, ArrowRight, Phone, MapPin, Mail, ChevronDown, Menu, X } from "lucide-react"

export default function HomePage() {
  const [categories, setCategories] = useState<{ nom: string; image: string }[]>([])
  const [entities, setEntities] = useState<
    Record<
      string,
      {
        id: number
        name: string
        image: string
        description: string
        offers: { reduction: number }[]
      }[]
    >
  >({})
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [displayCount, setDisplayCount] = useState(6)
  const [searchQuery, setSearchQuery] = useState("")
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const [chargement, setChargement] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const [nom, setNom] = useState("")
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")

  useEffect(() => {
    async function fetchData() {
      try {
        const catRes = await fetch("http://127.0.0.1:8000/api/public/categories")
        const entRes = await fetch("http://127.0.0.1:8000/api/public/entites")

        if (!catRes.ok || !entRes.ok) throw new Error("Erreur lors du chargement des données")

        const catData = await catRes.json()
        const entData = await entRes.json()

        const processedEntities = entData.reduce((acc: any, entity: any) => {
          const categoryName = entity.categorie.nom
          if (!acc[categoryName]) acc[categoryName] = []

          const entityObj = {
            id: entity.id,
            name: entity.nom_entites,
            image: `http://127.0.0.1:8000/storage/${entity.image}`,
            description: entity.description,
            offers: entity.offres.map((offre: any) => ({
              reduction: offre.reduction,
            })),
          }

          acc[categoryName].push(entityObj)

          const hasReduction = entityObj.offers.some((o: { reduction: number }) => o.reduction > 0)
          if (hasReduction) {
            if (!acc["À la Une"]) acc["À la Une"] = []
            acc["À la Une"].push(entityObj)
          }

          return acc
        }, {})

        setEntities(processedEntities)

        setCategories([
          { nom: "À la Une", image: "/images/featured.png" },
          ...catData.map((cat: any) => ({
            nom: cat.nom,
            image: `http://127.0.0.1:8000/storage/${cat.image}`,
          })),
        ])

        setSelectedCategory("À la Une")
      } catch (error) {
        console.error("Erreur de chargement :", error)
      }
    }

    fetchData()
  }, [])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setChargement(true)
    setSuccess(false)
    setError("")

    const token = localStorage.getItem("auth_token")

    const endpoint = token
      ? "http://127.0.0.1:8000/api/reclamations/auth"
      : "http://127.0.0.1:8000/api/reclamations/guest"

    const body = token ? { message } : { nom, email, message }

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(body),
      })

      const result = await response.json()

      if (response.ok) {
        setSuccess(true)
        setNom("")
        setEmail("")
        setMessage("")
      } else {
        setError(result.message || "Erreur lors de l'envoi")
      }
    } catch (err) {
      setError("Erreur lors de l'envoi")
    } finally {
      setChargement(false)
    }
  }

  const handleShowMore = () => {
    setDisplayCount((prev) => prev + 6)
  }

  const handleShowLess = () => {
    setDisplayCount(6)
  }

  const filteredEntities =
    entities[selectedCategory]?.filter((entity) => entity.name.toLowerCase().includes(searchQuery.toLowerCase())) || []

  return (
    <div className="bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen font-inter">
      {/* Enhanced Navbar */}
      <nav className="fixed top-0 left-0 w-full bg-white/95 backdrop-blur-md shadow-lg z-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
               <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">OF</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                OfferFlow
              </span>
            </div>

            {/* Desktop Menu */}
            <ul className="hidden md:flex space-x-8 text-sm font-medium">
              <li>
                <a
                  href="#accueil"
                  className="text-slate-700 hover:text-blue-600 transition-colors duration-300 relative group"
                >
                  Accueil
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
                </a>
              </li>
              <li>
                <a
                  href="#services"
                  className="text-slate-700 hover:text-blue-600 transition-colors duration-300 relative group"
                >
                  Services
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
                </a>
              </li>
              <li>
                <a
                  href="#contact"
                  className="text-slate-700 hover:text-blue-600 transition-colors duration-300 relative group"
                >
                  Contact
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
                </a>
              </li>
            </ul>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t border-slate-200">
              <ul className="space-y-2">
                <li>
                  <a href="#accueil" className="block py-2 text-slate-700 hover:text-blue-600">
                    Accueil
                  </a>
                </li>
                <li>
                  <a href="#services" className="block py-2 text-slate-700 hover:text-blue-600">
                    Services
                  </a>
                </li>
                <li>
                  <a href="#contact" className="block py-2 text-slate-700 hover:text-blue-600">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
          )}
        </div>
      </nav>

     {/* Enhanced Hero Section */}
<header id="accueil" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
  {/* Background Elements */}
  <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800"></div>
  <div className="absolute inset-0 bg-[url('/images/image.png?height=1080&width=1920')] bg-cover bg-center opacity-10"></div>

  {/* Floating Elements */}
  <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl animate-pulse"></div>
  <div className="absolute bottom-20 right-10 w-32 h-32 bg-purple-400/20 rounded-full blur-2xl animate-pulse delay-1000"></div>

  <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
    <div className="flex flex-col items-center text-center">
      <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
        Découvrez
        <span className="block bg-gradient-to-r from-purple-50 to-white-400 bg-clip-text text-transparent">
          OfferFlow
        </span>
        <span className="block text-3xl sm:text-4xl lg:text-5xl">Vos Offres Préférées</span>
      </h1>

      <p className="text-lg text-white/80 mb-8 max-w-lg">
        Explorez une sélection exclusive de produits et services avec des réductions incroyables. Rejoignez des
        milliers d'utilisateurs satisfaits.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link href="/login">
          <button className="group bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-blue-50 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center">
            Se Connecter
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </button>
        </Link>
        <Link href="/login_entite">
          <button className="group bg-gradient-to-r from-yellow-400 to-bleu-400 text-white px-8 py-4 rounded-xl font-semibold hover:from-yellow-500 hover:to-bleu-500 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center">
            Espace Prestataire
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </button>
        </Link>
      </div>
    </div>
  </div>
</header>

      {/* Enhanced Services Section */}
      <section id="services" className="py-20 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 rounded-full text-blue-600 text-sm font-medium mb-4">
              <Star className="w-4 h-4 mr-2" />
              Nos Services Premium
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-800 mb-4">
              Découvrez Nos <span className="text-blue-600">Offres Exclusives</span>
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Une sélection soigneusement choisie de partenaires et d'offres pour vous offrir la meilleure expérience.
            </p>
          </div>

          {/* Enhanced Search Bar */}
          <div className="mb-12 flex justify-center">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher par titre d'offre..."
                className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all duration-300 text-slate-700 placeholder-slate-400"
              />
            </div>
          </div>

          {/* Enhanced Category Filters */}
          <div className="flex flex-wrap justify-center gap-3 mb-16">
            {categories.map((category) => (
              <button
                key={category.nom}
                className={`group flex items-center space-x-3 px-6 py-3 rounded-2xl shadow-md transition-all duration-300 transform hover:scale-105 ${
                  selectedCategory === category.nom
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                    : "bg-white text-slate-700 hover:bg-blue-50 border border-slate-200"
                }`}
                onClick={() => {
                  setSelectedCategory(category.nom)
                  setDisplayCount(6)
                  setSearchQuery("")
                }}
              >
                <div className="relative">
                  <img
                    src={category.image || "/images/image.png.svg"}
                    alt={category.nom}
                    className="w-8 h-8 rounded-full object-cover border-2 border-white/50"
                    onError={(e) => (e.currentTarget.src = "/images/image.png?height=32&width=32")}
                  />
                  {selectedCategory === category.nom && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full"></div>
                  )}
                </div>
                <span className="font-medium">{category.nom}</span>
              </button>
            ))}
          </div>

          {/* Enhanced Entity Grid */}
          {filteredEntities.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredEntities.slice(0, displayCount).map((entity) => (
                  <Link key={entity.id} href={`/offre/${entity.id}`}>
                    <div className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-slate-100 overflow-hidden">
                      <div className="relative p-6 pb-4">
                        <div className="relative w-24 h-24 mx-auto mb-4">
                          <img
                            src={entity.image || "/images/image.png.svg"}
                            alt={entity.name}
                            className="w-full h-full object-cover rounded-2xl shadow-md"
                            onError={(e) => (e.currentTarget.src = "/images/image.png?height=96&width=96")}
                          />
                          
                        </div>

                        <h3 className="text-xl font-bold text-slate-800 text-center mb-3 group-hover:text-blue-600 transition-colors">
                          {entity.name}
                        </h3>

                        <p className="text-sm text-slate-600 text-center mb-4 line-clamp-2">
                          {entity.description || "Découvrez nos offres exceptionnelles"}
                        </p>
                      </div>

                      <div className="px-6 pb-6 space-y-2">
                        {entity.offers.slice(0, 2).map((offer, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100"
                          >
                            <span className="text-sm font-medium text-slate-700">Réduction</span>
                            <span className="text-lg font-bold text-blue-600">{offer.reduction}%</span>
                          </div>
                        ))}

                        <button className="w-full mt-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform group-hover:scale-105 flex items-center justify-center">
                          Voir l'offre
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </button>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Enhanced Pagination */}
              <div className="mt-12 flex justify-center space-x-4">
                {filteredEntities.length > displayCount && (
                  <button
                    onClick={handleShowMore}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center"
                  >
                    Voir Plus
                    <ChevronDown className="w-5 h-5 ml-2" />
                  </button>
                )}
                {displayCount > 6 && (
                  <button
                    onClick={handleShowLess}
                    className="bg-slate-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-slate-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    Voir Moins
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-lg text-slate-600">Aucun prestataire trouvé pour cette recherche.</p>
            </div>
          )}
        </div>
      </section>

      {/* Enhanced Contact Section */}
      <section id="contact" className="py-20 bg-gradient-to-br from-slate-50 to-blue-50 relative">
        <div className="absolute inset-0 bg-[url('/placeholder.svg?height=800&width=1600')] bg-cover bg-center opacity-5"></div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 rounded-full text-blue-600 text-sm font-medium mb-4">
              <Mail className="w-4 h-4 mr-2" />
              Contactez-nous
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-800 mb-4">
              Une Question ? <span className="text-blue-600">Parlons-en</span>
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Notre équipe est là pour vous accompagner. Envoyez-nous un message et nous vous répondrons rapidement.
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl p-8 lg:p-12 border border-slate-100">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Nom complet</label>
                  <input
                    type="text"
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    placeholder="Votre nom"
                    className="w-full px-4 py-4 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all duration-300"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="votre@email.com"
                    className="w-full px-4 py-4 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all duration-300"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Décrivez votre demande..."
                  className="w-full px-4 py-4 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all duration-300 resize-none"
                  rows={6}
                  required
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                disabled={chargement}
              >
                {chargement ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    Envoyer le message
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </button>

              {success && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                  <p className="text-green-700 font-medium text-center">✅ Message envoyé avec succès !</p>
                </div>
              )}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-red-700 font-medium text-center">❌ {error}</p>
                </div>
              )}
            </form>
          </div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-purple-900/20"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Brand Section */}
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <img src="/images/aa.png" alt="Logo" className="w-8 h-8" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  OfferFlow
                </span>
              </div>
              <p className="text-slate-300 mb-6 max-w-md leading-relaxed">
                Votre plateforme de confiance pour découvrir les meilleures offres et services. Rejoignez notre
                communauté et profitez d'avantages exclusifs.
              </p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors cursor-pointer">
                  <span className="text-sm font-bold">f</span>
                </div>
                <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors cursor-pointer">
                  <span className="text-sm font-bold">t</span>
                </div>
                <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors cursor-pointer">
                  <span className="text-sm font-bold">in</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-bold text-white mb-6">Liens Rapides</h3>
              <ul className="space-y-3">
                <li>
                  <a
                    href="#accueil"
                    className="text-slate-300 hover:text-blue-400 transition-colors duration-300 flex items-center group"
                  >
                    <ArrowRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                    Accueil
                  </a>
                </li>
                <li>
                  <a
                    href="#services"
                    className="text-slate-300 hover:text-blue-400 transition-colors duration-300 flex items-center group"
                  >
                    <ArrowRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                    Services
                  </a>
                </li>
                <li>
                  <a
                    href="#contact"
                    className="text-slate-300 hover:text-blue-400 transition-colors duration-300 flex items-center group"
                  >
                    <ArrowRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="text-lg font-bold text-white mb-6">Contact</h3>
              <ul className="space-y-4">
                <li className="flex items-center space-x-3 text-slate-300">
                  <div className="w-8 h-8 bg-blue-600/20 rounded-lg flex items-center justify-center">
                    <Phone className="w-4 h-4 text-blue-400" />
                  </div>
                  <span>+213 123 456 789</span>
                </li>
                <li className="flex items-center space-x-3 text-slate-300">
                  <div className="w-8 h-8 bg-blue-600/20 rounded-lg flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-blue-400" />
                  </div>
                  <span>Tunis, Nabeul</span>
                </li>
                <li className="flex items-center space-x-3 text-slate-300">
                  <div className="w-8 h-8 bg-blue-600/20 rounded-lg flex items-center justify-center">
                    <Mail className="w-4 h-4 text-blue-400" />
                  </div>
                  <span>contact@offerflow.com</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-slate-800">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-slate-400 text-sm">© {new Date().getFullYear()} OfferFlow. Tous droits réservés.</p>
              <div className="flex space-x-6 mt-4 md:mt-0">
                <a href="#" className="text-slate-400 hover:text-blue-400 text-sm transition-colors">
                  Politique de confidentialité
                </a>
                <a href="#" className="text-slate-400 hover:text-blue-400 text-sm transition-colors">
                  Conditions d'utilisation
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
