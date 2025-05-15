'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import {
  PhotoIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
} from '@heroicons/react/24/outline'

interface Photo {
  id: string
  url: string
  thumbnail_url: string
  title: string | null
  description: string | null
  taken_at: string | null
  metadata: any
}

interface Gallery {
  id: string
  title: string
  description: string | null
  is_public: boolean
  photos: Photo[]
}

interface PhotoGalleryProps {
  weddingId: string
}

export default function PhotoGallery({ weddingId }: PhotoGalleryProps) {
  const [galleries, setGalleries] = useState<Gallery[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedGallery, setSelectedGallery] = useState<Gallery | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  useEffect(() => {
    fetchGalleries()
  }, [weddingId])

  const fetchGalleries = async () => {
    try {
      const { data: galleriesData, error: galleriesError } = await supabase
        .from('photo_galleries')
        .select('*')
        .eq('wedding_id', weddingId)
        .order('created_at', { ascending: false })

      if (galleriesError) throw galleriesError

      const galleriesWithPhotos = await Promise.all(
        galleriesData.map(async (gallery) => {
          const { data: photos, error: photosError } = await supabase
            .from('photos')
            .select('*')
            .eq('gallery_id', gallery.id)
            .order('created_at', { ascending: false })

          if (photosError) throw photosError

          return {
            ...gallery,
            photos: photos || [],
          }
        })
      )

      setGalleries(galleriesWithPhotos)
    } catch (err) {
      console.error('Error fetching galleries:', err)
      setError('Failed to load photo galleries')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateGallery = async () => {
    const title = prompt('Enter gallery title:')
    if (!title) return

    try {
      const { data, error } = await supabase
        .from('photo_galleries')
        .insert([
          {
            wedding_id: weddingId,
            title,
            is_public: false,
          },
        ])
        .select()
        .single()

      if (error) throw error

      setGalleries([{ ...data, photos: [] }, ...galleries])
    } catch (err) {
      console.error('Error creating gallery:', err)
      setError('Failed to create gallery')
    }
  }

  const handleDeleteGallery = async (galleryId: string) => {
    if (!confirm('Are you sure you want to delete this gallery?')) return

    try {
      const { error } = await supabase
        .from('photo_galleries')
        .delete()
        .eq('id', galleryId)

      if (error) throw error

      setGalleries(galleries.filter((g) => g.id !== galleryId))
      if (selectedGallery?.id === galleryId) {
        setSelectedGallery(null)
      }
    } catch (err) {
      console.error('Error deleting gallery:', err)
      setError('Failed to delete gallery')
    }
  }

  const handleUploadPhotos = async (galleryId: string, files: FileList) => {
    setIsUploading(true)
    setUploadProgress(0)

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random()}.${fileExt}`
        const filePath = `${weddingId}/${galleryId}/${fileName}`

        // Upload original image
        const { error: uploadError } = await supabase.storage
          .from('photos')
          .upload(filePath, file)

        if (uploadError) throw uploadError

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('photos')
          .getPublicUrl(filePath)

        // Create thumbnail (you would need to implement this)
        const thumbnailUrl = publicUrl // For now, use the same URL

        // Add photo to database
        const { error: dbError } = await supabase.from('photos').insert([
          {
            gallery_id: galleryId,
            url: publicUrl,
            thumbnail_url: thumbnailUrl,
            title: file.name,
          },
        ])

        if (dbError) throw dbError

        setUploadProgress(((i + 1) / files.length) * 100)
      }

      // Refresh galleries
      await fetchGalleries()
    } catch (err) {
      console.error('Error uploading photos:', err)
      setError('Failed to upload photos')
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const handleDeletePhoto = async (galleryId: string, photoId: string) => {
    if (!confirm('Are you sure you want to delete this photo?')) return

    try {
      const { error } = await supabase.from('photos').delete().eq('id', photoId)

      if (error) throw error

      setGalleries(
        galleries.map((gallery) =>
          gallery.id === galleryId
            ? {
                ...gallery,
                photos: gallery.photos.filter((p) => p.id !== photoId),
              }
            : gallery
        )
      )
    } catch (err) {
      console.error('Error deleting photo:', err)
      setError('Failed to delete photo')
    }
  }

  const handleTogglePublic = async (galleryId: string, isPublic: boolean) => {
    try {
      const { error } = await supabase
        .from('photo_galleries')
        .update({ is_public: !isPublic })
        .eq('id', galleryId)

      if (error) throw error

      setGalleries(
        galleries.map((gallery) =>
          gallery.id === galleryId
            ? { ...gallery, is_public: !isPublic }
            : gallery
        )
      )
    } catch (err) {
      console.error('Error updating gallery visibility:', err)
      setError('Failed to update gallery visibility')
    }
  }

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 bg-gray-200 rounded" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-900">Photo Galleries</h2>
        <button
          onClick={handleCreateGallery}
          className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          <PlusIcon className="h-5 w-5 mr-1" />
          New Gallery
        </button>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {galleries.map((gallery) => (
          <div
            key={gallery.id}
            className="bg-white rounded-lg shadow overflow-hidden"
          >
            <div className="p-4">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-medium text-gray-900">
                  {gallery.title}
                </h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleTogglePublic(gallery.id, gallery.is_public)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    {gallery.is_public ? (
                      <EyeIcon className="h-5 w-5" />
                    ) : (
                      <EyeSlashIcon className="h-5 w-5" />
                    )}
                  </button>
                  <button
                    onClick={() => handleDeleteGallery(gallery.id)}
                    className="text-red-400 hover:text-red-500"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
              {gallery.description && (
                <p className="mt-1 text-sm text-gray-500">{gallery.description}</p>
              )}
            </div>

            <div className="border-t border-gray-200">
              <div className="p-4">
                <div className="grid grid-cols-2 gap-4">
                  {gallery.photos.slice(0, 4).map((photo) => (
                    <div key={photo.id} className="relative aspect-square">
                      <img
                        src={photo.thumbnail_url}
                        alt={photo.title || ''}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                  ))}
                  {gallery.photos.length === 0 && (
                    <div className="col-span-2 flex items-center justify-center h-32 bg-gray-50 rounded-lg">
                      <PhotoIcon className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                </div>

                <div className="mt-4">
                  <label className="block">
                    <span className="sr-only">Upload photos</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) =>
                        e.target.files &&
                        handleUploadPhotos(gallery.id, e.target.files)
                      }
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                    />
                  </label>
                </div>

                {isUploading && (
                  <div className="mt-4">
                    <div className="relative pt-1">
                      <div className="overflow-hidden h-2 text-xs flex rounded bg-indigo-200">
                        <div
                          style={{ width: `${uploadProgress}%` }}
                          className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 