'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { toast } from 'sonner'
import Image from 'next/image'

const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1, 'Slug is required'),
  content: z.string().min(1, 'Content is required'),
  excerpt: z.string().min(1, 'Excerpt is required'),
  coverImage: z.string().min(1, 'Cover image is required'),
  published: z.boolean().default(false),
  seo: z.object({
    title: z.string().min(1, 'SEO title is required'),
    description: z.string().min(1, 'SEO description is required'),
    keywords: z.string().min(1, 'SEO keywords are required'),
    ogImage: z.string().min(1, 'OG image is required'),
  }),
})

export default function EditBlogPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [blog, setBlog] = useState<any>(null)
  const [uploading, setUploading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      slug: '',
      content: '',
      excerpt: '',
      coverImage: '',
      published: false,
      seo: {
        title: '',
        description: '',
        keywords: '',
        ogImage: '',
      },
    },
  })

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const response = await fetch(`/api/admin/blogs/${params.id}`)
        if (!response.ok) throw new Error('Failed to fetch blog')
        const data = await response.json()
        setBlog(data)
        form.reset({
          title: data.title,
          slug: data.slug,
          content: data.content,
          excerpt: data.excerpt,
          coverImage: data.coverImage,
          published: data.published,
          seo: {
            title: data.seo.title,
            description: data.seo.description,
            keywords: data.seo.keywords,
            ogImage: data.seo.ogImage,
          },
        })
      } catch (error) {
        console.error('Error fetching blog:', error)
        toast.error('Failed to fetch blog')
      }
    }

    fetchBlog()
  }, [params.id, form])

  const handleImageUpload = async (file: File, field: 'coverImage' | 'seo.ogImage') => {
    try {
      setUploading(true)
      const formData = new FormData()
      formData.append('file', file)
      
      // Get the current image URL for the field
      const currentImage = field === 'coverImage' 
        ? form.getValues('coverImage')
        : form.getValues('seo.ogImage')
      
      if (currentImage) {
        formData.append('previousImage', currentImage)
      }

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to upload image')
      }

      const data = await response.json()
      
      // Update the form with the new image URL
      if (field === 'coverImage') {
        form.setValue('coverImage', data.url)
      } else {
        form.setValue('seo.ogImage', data.url)
      }

      toast.success('Image uploaded successfully')
    } catch (error) {
      console.error('Error uploading image:', error)
      toast.error('Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/blogs', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: params.id,
          ...values,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update blog')
      }

      toast.success('Blog updated successfully')
      router.push('/admin/blogs')
      router.refresh()
    } catch (error) {
      console.error('Error updating blog:', error)
      toast.error('Failed to update blog')
    } finally {
      setLoading(false)
    }
  }

  if (!blog) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Edit Blog</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Enter blog title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Slug</FormLabel>
                <FormControl>
                  <Input placeholder="Enter blog slug" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Content</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter blog content"
                    className="min-h-[200px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="excerpt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Excerpt</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter blog excerpt"
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="coverImage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cover Image</FormLabel>
                <FormControl>
                  <div className="space-y-4">
                    {field.value && (
                      <div className="relative w-64 h-64">
                        <Image
                          src={field.value}
                          alt="Cover"
                          fill
                          className="object-cover rounded-lg"
                        />
                      </div>
                    )}
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          handleImageUpload(file, 'coverImage')
                        }
                      }}
                      disabled={uploading}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">SEO Settings</h2>
            <FormField
              control={form.control}
              name="seo.title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SEO Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter SEO title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="seo.description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SEO Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter SEO description"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="seo.keywords"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SEO Keywords</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter SEO keywords" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="seo.ogImage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>OG Image</FormLabel>
                  <FormControl>
                    <div className="space-y-4">
                      {field.value && (
                        <div className="relative w-64 h-64">
                          <Image
                            src={field.value}
                            alt="OG Image"
                            fill
                            className="object-cover rounded-lg"
                          />
                        </div>
                      )}
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            handleImageUpload(file, 'seo.ogImage')
                          }
                        }}
                        disabled={uploading}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex items-center gap-4">
            <Button type="submit" disabled={loading || uploading}>
              {loading ? 'Updating...' : 'Update Blog'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/admin/blogs')}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
} 