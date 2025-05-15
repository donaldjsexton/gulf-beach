'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { supabase } from '@/lib/supabase/client'
import {
  PlusIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
} from '@heroicons/react/24/outline'

interface Gallery {
  id: string
  title: string
  description: string | null
  is_public: boolean
  photos: Photo[]
}

interface Photo {
  id: string
  url: string
  caption: string | null
  metadata: {
    width: number
    height: number
    size: number
    format: string
  }
}

interface PhotoGalleryProps {
  weddingId: string
}

export default function PhotoGallery({ weddingId }: PhotoGalleryProps) {
  const [galleries, setGalleries] = useState<Gallery[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState<number>(0)

  const fetchGalleries = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('photo_galleries')
        .select(`
          *,
          photos(*)
        `)
        .eq('wedding_id', weddingId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setGalleries(data)
    } catch (err) {
      console.error('Error fetching galleries:', err)
      setError('Failed to load galleries')
    } finally {
      setIsLoading(false)
    }
  }, [weddingId])

  useEffect(() => {
    fetchGalleries()
  }, [fetchGalleries])

  const handleCreateGallery = async () => {
    const title = prompt('Enter gallery title:')
    if (!title) return

    try {
      const { error } = await supabase.from('photo_galleries').insert([
        {
          wedding_id: weddingId,
          title,
          is_public: false,
        },
      ])

      if (error) throw error

      await fetchGalleries()
    } catch (err) {
      console.error('Error creating gallery:', err)
      setError('Failed to create gallery')
    }
  }

  const handleUploadPhotos = async (galleryId: string, files: FileList) => {
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random()}.${fileExt}`
        const filePath = `${weddingId}/${galleryId}/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('photos')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
          })

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('photos')
          .getPublicUrl(filePath)

        const { error: photoError } = await supabase.from('photos').insert([
          {
            gallery_id: galleryId,
            url: publicUrl,
            metadata: {
              width: 0, // These would be set after processing
              height: 0,
              size: file.size,
              format: fileExt,
            },
          },
        ])

        if (photoError) throw photoError

        setUploadProgress(((i + 1) / files.length) * 100)
      }

      await fetchGalleries()
      setUploadProgress(0)
    } catch (err) {
      console.error('Error uploading photos:', err)
      setError('Failed to upload photos')
      setUploadProgress(0)
    }
  }

  const handleToggleGalleryVisibility = async (
    galleryId: string,
    isPublic: boolean
  ) => {
    try {
      const { error } = await supabase
        .from('photo_galleries')
        .update({ is_public: !isPublic })
        .eq('id', galleryId)

      if (error) throw error

      await fetchGalleries()
    } catch (err) {
      console.error('Error updating gallery visibility:', err)
      setError('Failed to update gallery visibility')
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

      await fetchGalleries()
    } catch (err) {
      console.error('Error deleting gallery:', err)
      setError('Failed to delete gallery')
    }
  }

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-4" />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
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

      {uploadProgress > 0 && (
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-indigo-600 h-2.5 rounded-full"
            style={{ width: `${uploadProgress}%` }}
          />
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {galleries.map((gallery) => (
          <div
            key={gallery.id}
            className="bg-white rounded-lg shadow overflow-hidden"
          >
            <div className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {gallery.title}
                  </h3>
                  {gallery.description && (
                    <p className="mt-1 text-sm text-gray-500">
                      {gallery.description}
                    </p>
                  )}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() =>
                      handleToggleGalleryVisibility(gallery.id, gallery.is_public)
                    }
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
            </div>

            <div className="border-t border-gray-200">
              <div className="p-4">
                <div className="grid grid-cols-2 gap-4">
                  {gallery.photos.slice(0, 4).map((photo) => (
                    <div key={photo.id} className="relative aspect-square">
                      <Image
                        src={photo.url}
                        alt={photo.caption || ''}
                        fill
                        className="object-cover rounded-lg"
                      />
                    </div>
                  ))}
                </div>
                {gallery.photos.length > 4 && (
                  <p className="mt-2 text-sm text-gray-500">
                    +{gallery.photos.length - 4} more photos
                  </p>
                )}
              </div>

              <div className="border-t border-gray-200 p-4">
                <label className="block">
                  <span className="sr-only">Upload photos</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files) {
                        handleUploadPhotos(gallery.id, e.target.files)
                      }
                    }}
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-indigo-50 file:text-indigo-700
                      hover:file:bg-indigo-100"
                  />
                </label>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 