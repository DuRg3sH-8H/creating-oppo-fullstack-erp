"use client"

import { useState, useEffect } from "react"
import { useRole } from "@/components/role-context"
import { useTheme } from "@/components/theme-context"
import { ClubExplorerGrid } from "./club-explorer-grid"
import { ClubManagementGrid } from "./club-management-grid"
import { ClubDetailModal } from "./club-detail-modal"
import { RegistrationModal } from "./registration-modal"
import { AddClubModal } from "./add-club-modal"
import { EditClubModal } from "./edit-club-modal"
import { DeleteConfirmationDialog } from "./delete-confirmation-dialog"
import { RegisteredSchoolsModal } from "./registered-schools-modal"
import { ClubActivitiesModal } from "./club-activities-modal"
import type { Club, ClubActivity, ClubCategory } from "./types"
import { Button } from "@/components/ui/button"
import { PlusCircle, Search, Filter, Grid, List, Settings, Users, Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/auth-context"
import {
  fetchClubs,
  createClub,
  updateClub,
  deleteClub,
  fetchClubActivities,
  unregisterFromClub,
} from "@/lib/api/clubs"
import { useToast } from "@/components/ui/use-toast"

export function ClubsPage() {
  const [clubs, setClubs] = useState<Club[]>([])
  const [filteredClubs, setFilteredClubs] = useState<Club[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<ClubCategory | "all">("all")
  const [statusFilter, setStatusFilter] = useState<"all" | "Open" | "Closed" | "Coming Soon">("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [activeTab, setActiveTab] = useState("browse")

  // Modal states
  const [selectedClub, setSelectedClub] = useState<Club | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isRegistrationsModalOpen, setIsRegistrationsModalOpen] = useState(false)
  const [isActivitiesModalOpen, setIsActivitiesModalOpen] = useState(false)
  const [unregisterLoading, setUnregisterLoading] = useState(false)

  const { userRole } = useRole()
  const { theme: theme } = useTheme() as unknown as { theme: string }
  const { user } = useAuth()
  const { toast } = useToast()
  const isAdmin = userRole === "super-admin"
  const isSchoolAdmin = userRole === "school"
  const isEcaUser = userRole === "eca"
  const router = useRouter()

  // Load clubs on component mount
  useEffect(() => {
    loadClubs()
  }, [])

  // Filter clubs based on search, category, and status
  useEffect(() => {
    let filtered = [...clubs]

    if (searchQuery) {
      filtered = filtered.filter(
        (club) =>
          club.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          club.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          club.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          club.leadTeacher.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter((club) => club.category === categoryFilter)
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((club) => club.status === statusFilter)
    }

    setFilteredClubs(filtered)
  }, [clubs, searchQuery, categoryFilter, statusFilter])

  const loadClubs = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetchClubs()
      if (response.success) {
        // Process clubs to check if user's school is registered
        const processedClubs = response.data.map((club: Club) => {
          // Check if the current user's school is registered for this club
          const isRegistered = club.registrations?.some(
            (reg) => reg.schoolId === user?.schoolId,
          )

          return {
            ...club,
            isRegistered,
          }
        })

        setClubs(processedClubs)
      } else {
        setError("Failed to load clubs")
      }
    } catch (err) {
      setError("Failed to load clubs")
      console.error("Error loading clubs:", err)
    } finally {
      setLoading(false)
    }
  }

  // Club management functions (admin only)
  const handleAddClub = async (newClub: any) => {
    try {
      setError(null)
      const response = await createClub(newClub)

      if (response.success) {
        // Add the new club to the list
        setClubs((prevClubs) => [...prevClubs, response.data])
        setIsAddModalOpen(false)

        // Show success message
        toast({
          title: "Success",
          description: "Club created successfully",
        })
      } else {
        setError(response.error || "Failed to add club")
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to add club"
      setError(errorMessage)
      console.error("Error adding club:", err)
    }
  }

  const handleEditClub = async (updatedClub: Partial<Club> & { id: string }) => {
    try {
      const response = await updateClub(updatedClub.id, updatedClub)
      if (response.success) {
        setClubs(clubs.map((club) => (club.id === updatedClub.id ? { ...club, ...response.data } : club)))
        setIsEditModalOpen(false)
        setSelectedClub(null)
        toast({
          title: "Success",
          description: "Club updated successfully",
        })
      } else {
        setError("Failed to edit club")
      }
    } catch (err) {
      setError("Failed to edit club")
      console.error("Error editing club:", err)
    }
  }

  const handleDeleteClub = async (id: string) => {
    try {
      const response = await deleteClub(id)
      if (response.success) {
        setClubs(clubs.filter((club) => club.id !== id))
        setIsDeleteDialogOpen(false)
        setSelectedClub(null)
        toast({
          title: "Success",
          description: "Club deleted successfully",
        })
      } else {
        setError("Failed to delete club")
      }
    } catch (err) {
      setError("Failed to delete club")
      console.error("Error deleting club:", err)
    }
  }

  const handleSaveActivities = async (clubId: string, activities: ClubActivity[]) => {
    try {
      // Assuming you have API endpoints for managing club activities
      // and they return the updated club object after saving activities.
      // Replace the following lines with your actual API calls.
      const response = await fetchClubActivities(clubId)

      if (response.success) {
        setClubs(
          clubs.map((club) => {
            if (club.id === clubId) {
              return {
                ...club,
                activities: response.data,
                totalActivities: response.data.length,
              }
            }
            return club
          }),
        )
        setIsActivitiesModalOpen(false)
        toast({
          title: "Success",
          description: "Activities updated successfully",
        })
      } else {
        setError("Failed to save activities")
      }
    } catch (err) {
      setError("Failed to save activities")
      console.error("Error saving activities:", err)
    }
  }

  // User interaction functions
  const handleViewDetails = (club: Club) => {
    setSelectedClub(club)
    setIsDetailModalOpen(true)
  }

  const handleRegister = async (club: Club) => {
    // Just open the registration modal - the actual registration happens in the modal
    setSelectedClub(club)
    setIsRegistrationModalOpen(true)
  }

  const handleUnregister = async (club: Club) => {
    try {
      setUnregisterLoading(true)

      // Use the simplified unregister API call
      const response = await unregisterFromClub(club.id)

      if (response.success) {
        // Update local state to show the club as unregistered
        setClubs(
          clubs.map((c) =>
            c.id === club.id
              ? {
                  ...c,
                  isRegistered: false,
                  registeredSchools: (c.registeredSchools || 0) - 1,
                }
              : c,
          ),
        )

        toast({
          title: "Success",
          description: "Successfully unregistered from club",
        })
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to unregister from club",
          variant: "destructive",
        })
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to unregister from club",
        variant: "destructive",
      })
      console.error("Error unregistering from club:", err)
    } finally {
      setUnregisterLoading(false)
    }
  }

  const handleRegistrationSubmit = async (formData: any) => {
    try {
      if (selectedClub) {
        // Update local state to show the club as registered
        setClubs(
          clubs.map((c) =>
            c.id === selectedClub.id
              ? {
                  ...c,
                  isRegistered: true,
                  registeredSchools: (c.registeredSchools || 0) + 1,
                }
              : c,
          ),
        )

        toast({
          title: "Success",
          description: "Registration submitted successfully",
        })
      }
      setIsRegistrationModalOpen(false)
    } catch (err) {
      setError("Failed to complete registration")
      console.error("Error completing registration:", err)
    }
  }

  // Admin action handlers
  const openEditModal = (club: Club) => {
    setSelectedClub(club)
    setIsEditModalOpen(true)
  }

  const openDeleteDialog = (club: Club) => {
    setSelectedClub(club)
    setIsDeleteDialogOpen(true)
  }

  const openRegistrationsModal = (club: Club) => {
    setSelectedClub(club)
    setIsRegistrationsModalOpen(true)
  }

  const openActivitiesModal = (club: Club) => {
    setSelectedClub(club)
    setIsActivitiesModalOpen(true)
  }

  const categories: (ClubCategory | "all")[] = [
    "all",
    "Eco",
    "Heritage",
    "Drama",
    "Sports",
    "Academic",
    "Technology",
    "Arts",
    "Music",
    "Other",
  ]

  const statuses = ["all", "Open", "Closed", "Coming Soon"] as const

  return (
    <main className="flex-1 overflow-y-auto p-6">
      <div className="container mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold">{isAdmin ? "Clubs Management" : "Extracurricular Activities"}</h1>
            <p className="text-gray-500 mt-1">
              {isAdmin
                ? "Manage clubs, activities, and school registrations"
                : isSchoolAdmin
                  ? "Explore and register your school for clubs and activities"
                  : "Explore available clubs and activities"}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {!isAdmin && (
              <>
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("grid")}
                  className="h-9 w-9"
                >
                  <Grid size={18} />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("list")}
                  className="h-9 w-9"
                >
                  <List size={18} />
                </Button>
              </>
            )}

            {isAdmin && (
              <Button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2">
                <PlusCircle size={18} />
                Add Club
              </Button>
            )}
          </div>
        </div>

        {/* Admin Alert - Only for Super Admin */}
        {isAdmin && (
          <Alert className="mb-6 bg-blue-50 border-blue-200">
            <Settings className="h-4 w-4" />
            <AlertTitle className="text-blue-800">Super Admin View</AlertTitle>
            <AlertDescription className="text-blue-700">
              You have full management access to create, edit, and delete clubs, manage activities, and view school
              registrations.
            </AlertDescription>
          </Alert>
        )}

        {/* School Admin Info */}
        {isSchoolAdmin && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <Users className="h-4 w-4" />
            <AlertTitle className="text-green-800">School Administrator</AlertTitle>
            <AlertDescription className="text-green-700">
              You can register your school for available clubs and view detailed information about each activity.
            </AlertDescription>
          </Alert>
        )}

        {/* Role-specific content */}
        {isAdmin ? (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="browse" className="flex items-center gap-2">
                <Grid size={16} />
                Browse Clubs
              </TabsTrigger>
              <TabsTrigger value="manage" className="flex items-center gap-2">
                <Settings size={16} />
                Manage Clubs
              </TabsTrigger>
            </TabsList>

            <TabsContent value="browse">
              {/* Search and Filter for Admin Browse */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search clubs, teachers, or descriptions..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      />
                      <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <div className="relative">
                      <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value as ClubCategory | "all")}
                        className="appearance-none pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white min-w-[140px]"
                      >
                        {categories.map((category) => (
                          <option key={category} value={category}>
                            {category === "all" ? "All Categories" : category}
                          </option>
                        ))}
                      </select>
                      <Filter className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    </div>

                    <div className="relative">
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                        className="appearance-none pl-3 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white min-w-[120px]"
                      >
                        {statuses.map((status) => (
                          <option key={status} value={status}>
                            {status === "all" ? "All Status" : status}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="flex justify-center items-center h-32">
                  <Loader2 className="animate-spin h-6 w-6" />
                </div>
              ) : error ? (
                <Alert variant="destructive">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : (
                <ClubExplorerGrid
                  clubs={filteredClubs}
                  onViewDetails={handleViewDetails}
                  onRegister={handleRegister}
                  onUnregister={handleUnregister}
                  userRole={userRole}
                  theme={theme}
                  viewMode="grid"
                  showAdminActions={true}
                  onEdit={openEditModal}
                  onDelete={openDeleteDialog}
                  onViewRegistrations={openRegistrationsModal}
                  onManageActivities={openActivitiesModal}
                />
              )}
            </TabsContent>

            <TabsContent value="manage">
              {loading ? (
                <div className="flex justify-center items-center h-32">
                  <Loader2 className="animate-spin h-6 w-6" />
                </div>
              ) : error ? (
                <Alert variant="destructive">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : (
                <ClubManagementGrid
                  clubs={clubs}
                  onEdit={openEditModal}
                  onDelete={openDeleteDialog}
                  onViewRegistrations={openRegistrationsModal}
                  onManageActivities={openActivitiesModal}
                />
              )}
            </TabsContent>
          </Tabs>
        ) : (
          <>
            {/* School/ECA User View */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search clubs, teachers, or descriptions..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    />
                    <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  </div>
                </div>

                <div className="flex gap-2">
                  <div className="relative">
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value as ClubCategory | "all")}
                      className="appearance-none pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white min-w-[140px]"
                    >
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category === "all" ? "All Categories" : category}
                        </option>
                      ))}
                    </select>
                    <Filter className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  </div>

                  <div className="relative">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                      className="appearance-none pl-3 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white min-w-[120px]"
                    >
                      {statuses.map((status) => (
                        <option key={status} value={status}>
                          {status === "all" ? "All Status" : status}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-32">
                <Loader2 className="animate-spin h-6 w-6" />
              </div>
            ) : error ? (
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : (
              <ClubExplorerGrid
                clubs={filteredClubs}
                onViewDetails={handleViewDetails}
                onRegister={handleRegister}
                onUnregister={handleUnregister}
                userRole={userRole}
                theme={theme}
                viewMode={viewMode}
                showAdminActions={false}
              />
            )}
          </>
        )}
      </div>

      {/* Modals */}
      {/* Add Club Modal (Admin Only) - Always available */}
      {isAdmin && (
        <AddClubModal
          isOpen={isAddModalOpen}
          onClose={() => {
            setIsAddModalOpen(false)
            setError(null) // Clear any errors when closing
          }}
          onSubmit={handleAddClub}
        />
      )}

      {selectedClub && (
        <>
          <ClubDetailModal
            club={selectedClub}
            isOpen={isDetailModalOpen}
            onClose={() => setIsDetailModalOpen(false)}
            onRegister={() => handleRegister(selectedClub)}
          />

          <RegistrationModal
            club={selectedClub}
            isOpen={isRegistrationModalOpen}
            onClose={() => setIsRegistrationModalOpen(false)}
            onSubmit={handleRegistrationSubmit}
          />

          {/* Admin-only modals */}
          {isAdmin && selectedClub && (
            <>
              <EditClubModal
                club={selectedClub}
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSubmit={handleEditClub}
              />

              <DeleteConfirmationDialog
                club={selectedClub}
                isOpen={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={() => handleDeleteClub(selectedClub.id)}
              />

              <RegisteredSchoolsModal
                club={selectedClub}
                isOpen={isRegistrationsModalOpen}
                onClose={() => setIsRegistrationsModalOpen(false)}
              />

              <ClubActivitiesModal
                club={selectedClub}
                isOpen={isActivitiesModalOpen}
                onClose={() => setIsActivitiesModalOpen(false)}
                onSave={(activities) => handleSaveActivities(selectedClub.id, activities)}
              />
            </>
          )}
        </>
      )}
    </main>
  )
}
