"use client"

import { useState, useEffect } from "react"
import { Search, Filter, Grid, List, Zap } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import Image from "next/image"

interface Pokemon {
  id: number
  name: string
  types: string[]
  sprite: string
  height: number
  weight: number
  generation: number
}

const typeColors: { [key: string]: string } = {
  normal: "bg-gray-400",
  fire: "bg-red-500",
  water: "bg-blue-500",
  electric: "bg-yellow-400",
  grass: "bg-green-500",
  ice: "bg-blue-200",
  fighting: "bg-red-700",
  poison: "bg-purple-500",
  ground: "bg-yellow-600",
  flying: "bg-indigo-400",
  psychic: "bg-pink-500",
  bug: "bg-green-400",
  rock: "bg-yellow-800",
  ghost: "bg-purple-700",
  dragon: "bg-indigo-700",
  dark: "bg-gray-800",
  steel: "bg-gray-500",
  fairy: "bg-pink-300",
}

const generations = [
  { id: 1, name: "Kanto", range: "1-151", color: "bg-red-500" },
  { id: 2, name: "Johto", range: "152-251", color: "bg-yellow-500" },
  { id: 3, name: "Hoenn", range: "252-386", color: "bg-green-500" },
  { id: 4, name: "Sinnoh", range: "387-493", color: "bg-blue-500" },
  { id: 5, name: "Unova", range: "494-649", color: "bg-purple-500" },
  { id: 6, name: "Kalos", range: "650-721", color: "bg-pink-500" },
  { id: 7, name: "Alola", range: "722-809", color: "bg-orange-500" },
  { id: 8, name: "Galar", range: "810-898", color: "bg-indigo-500" },
]

const getGeneration = (id: number): number => {
  if (id <= 151) return 1
  if (id <= 251) return 2
  if (id <= 386) return 3
  if (id <= 493) return 4
  if (id <= 649) return 5
  if (id <= 721) return 6
  if (id <= 809) return 7
  return 8
}

export default function PokeDex() {
  const [pokemon, setPokemon] = useState<Pokemon[]>([])
  const [filteredPokemon, setFilteredPokemon] = useState<Pokemon[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState("all")
  const [selectedGeneration, setSelectedGeneration] = useState("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [currentPage, setCurrentPage] = useState(1)
  const pokemonPerPage = 24

  useEffect(() => {
    fetchAllPokemon()
  }, [])

  useEffect(() => {
    filterPokemon()
  }, [pokemon, searchTerm, selectedType, selectedGeneration])

  const fetchAllPokemon = async () => {
    try {
      setLoading(true)
      setLoadingProgress(0)

      // Fetch all 898 Pokemon at once
      const response = await fetch("https://pokeapi.co/api/v2/pokemon?limit=898")
      const data = await response.json()

      const totalPokemon = data.results.length
      const batchSize = 50 // Process in batches for better UX
      const pokemonDetails: Pokemon[] = []

      for (let i = 0; i < totalPokemon; i += batchSize) {
        const batch = data.results.slice(i, i + batchSize)

        const batchDetails = await Promise.all(
          batch.map(async (poke: any) => {
            try {
              const details = await fetch(poke.url).then((res) => res.json())
              return {
                id: details.id,
                name: details.name,
                types: details.types.map((type: any) => type.type.name),
                sprite:
                  details.sprites.other["official-artwork"]?.front_default ||
                  details.sprites.other.dream_world?.front_default ||
                  details.sprites.front_default,
                height: details.height,
                weight: details.weight,
                generation: getGeneration(details.id),
              }
            } catch (error) {
              console.error(`Error fetching ${poke.name}:`, error)
              return null
            }
          }),
        )

        const validBatch = batchDetails.filter(Boolean) as Pokemon[]
        pokemonDetails.push(...validBatch)

        // Update progress
        setLoadingProgress(Math.round(((i + batchSize) / totalPokemon) * 100))
      }

      // Sort by ID to maintain order
      pokemonDetails.sort((a, b) => a.id - b.id)
      setPokemon(pokemonDetails)
    } catch (error) {
      console.error("Error fetching Pokemon:", error)
    } finally {
      setLoading(false)
      setLoadingProgress(100)
    }
  }

  const filterPokemon = () => {
    let filtered = pokemon

    if (searchTerm) {
      filtered = filtered.filter(
        (p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.id.toString().includes(searchTerm),
      )
    }

    if (selectedType !== "all") {
      filtered = filtered.filter((p) => p.types.includes(selectedType))
    }

    if (selectedGeneration !== "all") {
      filtered = filtered.filter((p) => p.generation === Number.parseInt(selectedGeneration))
    }

    setFilteredPokemon(filtered)
    setCurrentPage(1)
  }

  const getCurrentPagePokemon = () => {
    const startIndex = (currentPage - 1) * pokemonPerPage
    const endIndex = startIndex + pokemonPerPage
    return filteredPokemon.slice(startIndex, endIndex)
  }

  const totalPages = Math.ceil(filteredPokemon.length / pokemonPerPage)
  const allTypes = Array.from(new Set(pokemon.flatMap((p) => p.types))).sort()

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Carregando Pokédex Nacional</h2>
          <p className="text-lg text-gray-600 mb-4">Carregando todas as 8 gerações...</p>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${loadingProgress}%` }}
            ></div>
          </div>

          <div className="flex justify-between text-sm text-gray-500 mb-6">
            <span>0%</span>
            <span className="font-semibold">{loadingProgress}%</span>
            <span>100%</span>
          </div>

          <div className="grid grid-cols-4 gap-2 text-xs">
            {generations.map((gen, index) => (
              <div
                key={gen.id}
                className={`p-2 rounded ${
                  loadingProgress > (index * 12.5) ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-500"
                }`}
              >
                <div className={`w-2 h-2 rounded-full mx-auto mb-1 ${gen.color}`}></div>
                <div className="font-medium">{gen.name}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-lg border-b-4 border-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
                <div className="w-6 h-6 bg-white rounded-full"></div>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Pokédex Nacional</h1>
                <p className="text-gray-600">8 Gerações • {pokemon.length} Pokémon</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Generation Quick Access */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3 text-gray-800">Gerações</h2>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedGeneration === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedGeneration("all")}
              className="flex items-center space-x-1"
            >
              <Zap className="w-3 h-3" />
              <span>Todas</span>
            </Button>
            {generations.map((gen) => (
              <Button
                key={gen.id}
                variant={selectedGeneration === gen.id.toString() ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedGeneration(gen.id.toString())}
                className="flex items-center space-x-1"
              >
                <div className={`w-2 h-2 rounded-full ${gen.color}`}></div>
                <span>{gen.name}</span>
                <span className="text-xs opacity-70">({gen.range})</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar por nome ou número..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                {allTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${typeColors[type]}`}></div>
                      <span className="capitalize">{type}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              Mostrando {getCurrentPagePokemon().length} de {filteredPokemon.length} Pokémon
            </span>
            <span className="text-green-600 font-medium">✓ Todos os Pokémon carregados</span>
          </div>
        </div>

        {/* Pokemon Grid/List */}
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-8">
            {getCurrentPagePokemon().map((poke) => (
              <Link key={poke.id} href={`/pokemon/${poke.id}`}>
                <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer bg-white">
                  <CardContent className="p-3">
                    <div className="text-center">
                      <div className="relative mb-3">
                        <Image
                          src={poke.sprite || "/placeholder.svg?height=96&width=96"}
                          alt={poke.name}
                          width={96}
                          height={96}
                          className="mx-auto group-hover:scale-110 transition-transform duration-300"
                        />
                        <span className="absolute top-0 right-0 bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                          #{poke.id.toString().padStart(3, "0")}
                        </span>
                        <div
                          className={`absolute top-0 left-0 w-3 h-3 rounded-full ${generations[poke.generation - 1]?.color}`}
                        ></div>
                      </div>
                      <h3 className="font-semibold text-sm capitalize mb-2 text-gray-800 truncate">{poke.name}</h3>
                      <div className="flex flex-wrap gap-1 justify-center">
                        {poke.types.map((type) => (
                          <Badge key={type} className={`${typeColors[type]} text-white text-xs px-2 py-0.5`}>
                            {type}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="space-y-3 mb-8">
            {getCurrentPagePokemon().map((poke) => (
              <Link key={poke.id} href={`/pokemon/${poke.id}`}>
                <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer bg-white">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <Image
                          src={poke.sprite || "/placeholder.svg?height=64&width=64"}
                          alt={poke.name}
                          width={64}
                          height={64}
                          className="group-hover:scale-110 transition-transform duration-300"
                        />
                        <div
                          className={`absolute -top-1 -left-1 w-3 h-3 rounded-full ${generations[poke.generation - 1]?.color}`}
                        ></div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-gray-500 text-sm">#{poke.id.toString().padStart(3, "0")}</span>
                          <h3 className="font-semibold text-lg capitalize text-gray-800">{poke.name}</h3>
                          <Badge variant="secondary" className="text-xs">
                            {generations[poke.generation - 1]?.name}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {poke.types.map((type) => (
                            <Badge key={type} className={`${typeColors[type]} text-white`}>
                              {type}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="text-right text-sm text-gray-600">
                        <div>Altura: {(poke.height / 10).toFixed(1)}m</div>
                        <div>Peso: {(poke.weight / 10).toFixed(1)}kg</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2">
            <Button
              variant="outline"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Anterior
            </Button>

            <div className="flex space-x-1">
              {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
                let pageNum
                if (totalPages <= 7) {
                  pageNum = i + 1
                } else if (currentPage <= 4) {
                  pageNum = i + 1
                } else if (currentPage >= totalPages - 3) {
                  pageNum = totalPages - 6 + i
                } else {
                  pageNum = currentPage - 3 + i
                }

                if (pageNum > totalPages || pageNum < 1) return null

                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                    className="w-10"
                  >
                    {pageNum}
                  </Button>
                )
              })}
            </div>

            <Button
              variant="outline"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Próximo
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
