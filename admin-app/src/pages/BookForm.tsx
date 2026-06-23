import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Upload } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { z } from 'zod';

import {
  useCreateBookMutation,
  useGetBookQuery,
  useUpdateBookMutation,
} from '../store/api/booksApi.ts';

const bookFormSchema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  author: z.string().trim().min(1, 'Author is required'),
  description: z.string().trim().min(1, 'Description is required'),
  category: z.string().trim().min(1, 'Category is required'),
  priceRupees: z.coerce.number().positive('Price must be greater than zero'),
});

type BookFormValues = z.infer<typeof bookFormSchema>;

interface FileDropProps {
  label: string;
  file: File | null;
  accept: Record<string, string[]>;
  onFile: (file: File | null) => void;
}

function FileDrop({ label, file, accept, onFile }: FileDropProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept,
    maxFiles: 1,
    onDrop: (accepted) => onFile(accepted[0] ?? null),
  });

  return (
    <div
      {...getRootProps()}
      className={`rounded-box border border-dashed p-4 text-center ${
        isDragActive ? 'border-primary bg-primary/10' : 'border-base-300 bg-base-200'
      }`}
    >
      <input {...getInputProps()} />
      <Upload className="mx-auto mb-2 h-5 w-5" />
      <p className="font-medium">{label}</p>
      <p className="mt-1 text-sm text-base-content/70">
        {file ? file.name : 'Drop file or click to browse'}
      </p>
    </div>
  );
}

export default function BookFormPage() {
  const navigate = useNavigate();
  const id = useParams().id;
  const isEdit = Boolean(id);
  const { data } = useGetBookQuery(id ?? '', { skip: !id });
  const [createBook, createState] = useCreateBookMutation();
  const [updateBook, updateState] = useUpdateBookMutation();
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [pdf, setPdf] = useState<File | null>(null);
  const [samplePdf, setSamplePdf] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BookFormValues>({
    resolver: zodResolver(bookFormSchema),
    defaultValues: {
      title: '',
      author: '',
      description: '',
      category: '',
      priceRupees: 0,
    },
  });

  useEffect(() => {
    if (!data?.book) return;
    reset({
      title: data.book.title,
      author: data.book.author,
      description: data.book.description,
      category: data.book.category,
      priceRupees: data.book.price / 100,
    });
  }, [data, reset]);

  const previewUrl = useMemo(() => {
    if (!coverImage) return data?.book.coverImageUrl ?? '';
    return URL.createObjectURL(coverImage);
  }, [coverImage, data?.book.coverImageUrl]);

  useEffect(() => {
    return () => {
      if (previewUrl.startsWith('blob:')) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const onSubmit = handleSubmit(async (values) => {
    if (!isEdit && (!coverImage || !pdf)) {
      toast.error('Cover image and PDF are required');
      return;
    }

    const formData = new FormData();
    formData.set('title', values.title);
    formData.set('author', values.author);
    formData.set('description', values.description);
    formData.set('category', values.category);
    formData.set('price', String(Math.round(values.priceRupees * 100)));
    if (coverImage) formData.set('coverImage', coverImage);
    if (pdf) formData.set('pdf', pdf);
    if (samplePdf) formData.set('samplePdf', samplePdf);

    try {
      if (isEdit && id) {
        await updateBook({ id, data: formData }).unwrap();
        toast.success('Book updated');
      } else {
        await createBook(formData).unwrap();
        toast.success('Book created as draft');
      }
      navigate('/books');
    } catch {
      toast.error('Could not save book');
    }
  });

  return (
    <section className="space-y-4">
      <Link to="/books" className="btn btn-ghost btn-sm">
        <ArrowLeft className="h-4 w-4" />
        Books
      </Link>
      <form onSubmit={onSubmit} className="grid gap-5 lg:grid-cols-[1fr_320px]" noValidate>
        <div className="space-y-4 rounded-box bg-base-100 p-5 shadow-sm">
          <h1 className="text-3xl font-bold">{isEdit ? 'Edit Book' : 'Add Book'}</h1>

          <label className="form-control">
            <span className="label-text">Title</span>
            <input className="input input-bordered" {...register('title')} />
          </label>
          {errors.title && <p className="text-sm text-error">{errors.title.message}</p>}

          <label className="form-control">
            <span className="label-text">Author</span>
            <input className="input input-bordered" {...register('author')} />
          </label>
          {errors.author && <p className="text-sm text-error">{errors.author.message}</p>}

          <label className="form-control">
            <span className="label-text">Category</span>
            <input className="input input-bordered" {...register('category')} />
          </label>
          {errors.category && <p className="text-sm text-error">{errors.category.message}</p>}

          <label className="form-control">
            <span className="label-text">Price (INR)</span>
            <input
              type="number"
              min="1"
              step="1"
              className="input input-bordered"
              {...register('priceRupees')}
            />
          </label>
          {errors.priceRupees && <p className="text-sm text-error">{errors.priceRupees.message}</p>}

          <label className="form-control">
            <span className="label-text">Description</span>
            <textarea
              className="textarea textarea-bordered min-h-40"
              {...register('description')}
            />
          </label>
          {errors.description && <p className="text-sm text-error">{errors.description.message}</p>}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={createState.isLoading || updateState.isLoading}
          >
            {isEdit ? 'Save Changes' : 'Create Book'}
          </button>
        </div>

        <aside className="space-y-4">
          {previewUrl && (
            <img
              src={previewUrl}
              alt="Cover preview"
              className="aspect-[2/3] w-full rounded-box object-cover shadow-sm"
            />
          )}
          <FileDrop
            label="Cover image"
            file={coverImage}
            accept={{ 'image/*': [] }}
            onFile={setCoverImage}
          />
          <FileDrop
            label="PDF file"
            file={pdf}
            accept={{ 'application/pdf': ['.pdf'] }}
            onFile={setPdf}
          />
          <FileDrop
            label="Sample PDF"
            file={samplePdf}
            accept={{ 'application/pdf': ['.pdf'] }}
            onFile={setSamplePdf}
          />
        </aside>
      </form>
    </section>
  );
}
