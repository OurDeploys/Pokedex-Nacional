"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Heart, Share2, Ruler, Weight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import Image from "next/image"
import { useParams } from "next/navigation"

interface PokemonDetail {
  id: number
  name: string
  types: string[]
  sprite: string
  height: number
  weight: number
  stats: { name: string; value: number }[]
  abilities: string[]
  description: string
  evolutionChain?: { id: number; name: string; sprite: string }[]
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

export default function PokemonDetail() {
  const params = useParams()
  const [pokemon, setPokemon] = useState<PokemonDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchPokemonDetail(params.id as string)
    }
  }, [params.id])

  const fetchPokemonDetail = async (id: string) => {
    try {
      setLoading(true)

      // Fetch basic pokemon data
      const pokemonResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
      const pokemonData = await pokemonResponse.json()

      // Fetch species data for description
      const speciesResponse = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`)
      const speciesData = await speciesResponse.json()

      const description =
        speciesData.flavor_text_entries
          .find((entry: any) => entry.language.name === "en")
          ?.flavor_text.replace(/\f/g, " ") || "No description available."

      const pokemonDetail: PokemonDetail = {
        id: pokemonData.id,
        name: pokemonData.name,
        types: pokemonData.types.map((type: any) => type.type.name),
        sprite: pokemonData.sprites.other["official-artwork"].front_default || pokemonData.sprites.front_default,
        height: pokemonData.height,
        weight: pokemonData.weight,
        stats: pokemonData.stats.map((stat: any) => ({
          name: stat.stat.name,
          value: stat.base_stat,
        })),
        abilities: pokemonData.abilities.map((ability: any) => ability.ability.name),
        description,
      }

      setPokemon(pokemonDetail)
    } catch (error) {
      console.error("Error fetching Pokemon detail:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Carregando Pokémon...</p>
        </div>
      </div>
    )
  }

  if (!pokemon) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-600">Pokémon não encontrado</p>
          <Link href="/">
            <Button className="mt-4">Voltar à Pokédex</Button>
          </Link>
        </div>
      </div>
    )
  }

  const primaryType = pokemon.types[0]
  const typeGradient = `from-${primaryType === "fire" ? "red" : primaryType === "water" ? "blue" : primaryType === "grass" ? "green" : "gray"}-400 to-${primaryType === "fire" ? "red" : primaryType === "water" ? "blue" : primaryType === "grass" ? "green" : "gray"}-600`

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-lg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Button variant="ghost" className="flex items-center space-x-2">
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar à Pokédex</span>
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm">
                <Heart className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Pokemon Info */}
        <Card className="mb-8 overflow-hidden">
          <div className={`bg-gradient-to-r ${typeGradient} p-8 text-white`}>
            <div className="flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-8">
              <div className="relative">
                <Image
                  src={pokemon.sprite || "/placeholder.svg"}
                  alt={pokemon.name}
                  width={200}
                  height={200}
                  className="drop-shadow-2xl"
                />
                <span className="absolute -top-2 -right-2 bg-white text-gray-800 text-sm px-3 py-1 rounded-full font-semibold">
                  #{pokemon.id.toString().padStart(3, "0")}
                </span>
              </div>
              <div className="text-center md:text-left">
                <h1 className="text-4xl font-bold capitalize mb-4">{pokemon.name}</h1>
                <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-4">
                  {pokemon.types.map((type) => (
                    <Badge key={type} className="bg-white/20 text-white border-white/30 text-lg px-4 py-1">
                      {type}
                    </Badge>
                  ))}
                </div>
                <p className="text-lg opacity-90 max-w-md">{pokemon.description}</p>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Physical Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Ruler className="w-5 h-5" />
                <span>Características Físicas</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Ruler className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">Altura</span>
                </div>
                <span className="text-lg font-semibold">{(pokemon.height / 10).toFixed(1)}m</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Weight className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">Peso</span>
                </div>
                <span className="text-lg font-semibold">{(pokemon.weight / 10).toFixed(1)}kg</span>
              </div>
              <div>
                <span className="font-medium mb-2 block">Habilidades</span>
                <div className="flex flex-wrap gap-2">
                  {pokemon.abilities.map((ability) => (
                    <Badge key={ability} variant="secondary" className="capitalize">
                      {ability.replace("-", " ")}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Base Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Estatísticas Base</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {pokemon.stats.map((stat) => (
                <div key={stat.name}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium capitalize">{stat.name.replace("-", " ")}</span>
                    <span className="text-sm font-semibold">{stat.value}</span>
                  </div>
                  <Progress value={(stat.value / 255) * 100} className="h-2" />
                </div>
              ))}
              <div className="pt-4 border-t">
                <div className="flex justify-between">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold text-lg">{pokemon.stats.reduce((sum, stat) => sum + stat.value, 0)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation */}
        <div className="mt-8 flex justify-between">
          {pokemon.id > 1 && (
            <Link href={`/pokemon/${pokemon.id - 1}`}>
              <Button variant="outline" className="flex items-center space-x-2">
                <ArrowLeft className="w-4 h-4" />
                <span>Pokémon Anterior</span>
              </Button>
            </Link>
          )}
          <div className="flex-1"></div>
          {pokemon.id < 898 && (
            <Link href={`/pokemon/${pokemon.id + 1}`}>
              <Button variant="outline" className="flex items-center space-x-2">
                <span>Próximo Pokémon</span>
                <ArrowLeft className="w-4 h-4 rotate-180" />
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
