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
    <div {...getRootProps()} className={`dropzone ${isDragActive ? 'dropzone-active' : ''}`}>
      <input {...getInputProps()} />
      <Upload size={20} />
      <p>{label}</p>
      <p className="muted-sm">{file ? file.name : 'Drop file or click to browse'}</p>
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
    <section className="section">
      <Link to="/books" className="btn btn-ghost btn-sm">
        <ArrowLeft size={16} />
        Books
      </Link>

      <form onSubmit={onSubmit} className="admin-form-grid" noValidate>
        <div className="panel">
          <p className="eyebrow">Catalogue editor</p>
          <h1>{isEdit ? 'Edit Book' : 'Add Book'}</h1>

          <label className="field">
            <span>Title</span>
            <input {...register('title')} />
          </label>
          {errors.title && <p className="form-error">{errors.title.message}</p>}

          <label className="field">
            <span>Author</span>
            <input {...register('author')} />
          </label>
          {errors.author && <p className="form-error">{errors.author.message}</p>}

          <label className="field">
            <span>Category</span>
            <input {...register('category')} />
          </label>
          {errors.category && <p className="form-error">{errors.category.message}</p>}

          <label className="field">
            <span>Price (INR)</span>
            <input type="number" min="1" step="1" {...register('priceRupees')} />
          </label>
          {errors.priceRupees && <p className="form-error">{errors.priceRupees.message}</p>}

          <label className="field">
            <span>Description</span>
            <textarea className="admin-textarea" {...register('description')} />
          </label>
          {errors.description && <p className="form-error">{errors.description.message}</p>}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={createState.isLoading || updateState.isLoading}
          >
            {isEdit ? 'Save Changes' : 'Create Book'}
          </button>
        </div>

        <aside className="admin-side-panel">
          {previewUrl && <img src={previewUrl} alt="Cover preview" className="book-form-preview" />}
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
