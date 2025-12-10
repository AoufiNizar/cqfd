
import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Calendar, User, Tag, Plus, Trash2, Edit, Save, X, Image as ImageIcon } from 'lucide-react';
import { BlogPost } from '../types';
import { SmartText } from './Latex';
import { RichTextEditor } from './RichTextEditor';

interface BlogViewProps {
  posts: BlogPost[];
  isTeacherMode: boolean;
  onUpdatePosts: (posts: BlogPost[]) => void;
}

export const BlogView: React.FC<BlogViewProps> = ({ posts, isTeacherMode, onUpdatePosts }) => {
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editImage, setEditImage] = useState('');
  const [editTags, setEditTags] = useState('');

  // Sort by date desc
  const sortedPosts = [...posts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleCreate = () => {
    const newId = uuidv4();
    const newPost: BlogPost = {
        id: newId,
        title: 'Nouvel Article',
        content: 'Rédigez votre contenu ici... Vous pouvez utiliser du LaTeX: $$ E=mc^2 $$',
        date: new Date().toISOString(),
        author: 'AOUFI Nizar',
        tags: ['Maths']
    };
    onUpdatePosts([newPost, ...posts]);
    startEditing(newPost);
  };

  const handleDelete = (id: string) => {
    if(confirm("Supprimer cet article ?")) {
        onUpdatePosts(posts.filter(p => p.id !== id));
    }
  };

  const startEditing = (post: BlogPost) => {
    setEditingPostId(post.id);
    setEditTitle(post.title);
    setEditContent(post.content);
    setEditImage(post.imageUrl || '');
    setEditTags(post.tags ? post.tags.join(', ') : '');
  };

  const saveEditing = () => {
    onUpdatePosts(posts.map(p => {
        if(p.id === editingPostId) {
            return {
                ...p,
                title: editTitle,
                content: editContent,
                imageUrl: editImage,
                tags: editTags.split(',').map(t => t.trim()).filter(t => t.length > 0)
            };
        }
        return p;
    }));
    setEditingPostId(null);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 animate-fade-in">
        <div className="flex justify-between items-end mb-12 border-b border-space-800 pb-6">
            <div>
                <h1 className="text-4xl font-bold text-slate-100 mb-2">Le Blog du Prof</h1>
                <p className="text-space-400">Actualités, conseils et vie des maths.</p>
            </div>
            {isTeacherMode && (
                <button 
                    onClick={handleCreate}
                    className="bg-space-accent text-space-950 px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-blue-400 transition-colors shadow-lg"
                >
                    <Plus size={18} /> Nouvel Article
                </button>
            )}
        </div>

        {editingPostId && (
            <div className="fixed inset-0 z-[70] bg-space-950/90 backdrop-blur-md flex items-center justify-center p-4">
                <div className="bg-space-900 w-full max-w-3xl rounded-xl border border-space-700 shadow-2xl flex flex-col max-h-[90vh]">
                     <div className="flex justify-between items-center p-6 border-b border-space-800">
                        <h2 className="text-xl font-bold text-slate-100">Éditer l'article</h2>
                        <button onClick={() => setEditingPostId(null)}><X className="text-space-400 hover:text-white"/></button>
                     </div>
                     <div className="p-6 overflow-y-auto space-y-4">
                        <div>
                            <label className="text-xs uppercase font-bold text-space-500">Titre</label>
                            <input value={editTitle} onChange={e => setEditTitle(e.target.value)} className="w-full bg-space-950 border border-space-700 rounded p-3 text-white mt-1"/>
                        </div>
                        <div>
                            <label className="text-xs uppercase font-bold text-space-500">Image URL</label>
                            <div className="flex gap-2">
                                <input value={editImage} onChange={e => setEditImage(e.target.value)} className="w-full bg-space-950 border border-space-700 rounded p-3 text-white mt-1 placeholder-space-700" placeholder="https://..."/>
                                {editImage && <img src={editImage} alt="preview" className="h-12 w-12 object-cover rounded border border-space-700 mt-1"/>}
                            </div>
                        </div>
                        <div>
                            <label className="text-xs uppercase font-bold text-space-500">Tags (séparés par des virgules)</label>
                            <input value={editTags} onChange={e => setEditTags(e.target.value)} className="w-full bg-space-950 border border-space-700 rounded p-3 text-white mt-1"/>
                        </div>
                        <div>
                            <label className="text-xs uppercase font-bold text-space-500 mb-1 block">Contenu</label>
                            <RichTextEditor value={editContent} onChange={setEditContent} minHeight="min-h-[300px]" />
                        </div>
                     </div>
                     <div className="p-6 border-t border-space-800 flex justify-end gap-3">
                         <button onClick={() => setEditingPostId(null)} className="px-4 py-2 text-space-400 hover:text-white">Annuler</button>
                         <button onClick={saveEditing} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-500 flex items-center gap-2"><Save size={16}/> Enregistrer</button>
                     </div>
                </div>
            </div>
        )}

        <div className="space-y-12">
            {sortedPosts.length === 0 && <p className="text-space-600 text-center italic">Aucun article pour le moment.</p>}

            {sortedPosts.map(post => (
                <article key={post.id} className="bg-space-900 rounded-2xl border border-space-800 overflow-hidden shadow-lg hover:border-space-700 transition-colors group">
                    {post.imageUrl && (
                        <div className="w-full h-64 overflow-hidden relative">
                            <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100" />
                            <div className="absolute inset-0 bg-gradient-to-t from-space-900 to-transparent"></div>
                        </div>
                    )}
                    
                    <div className="p-8 relative">
                        {/* Meta */}
                        <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-space-400 mb-4 uppercase tracking-wider">
                            <div className="flex items-center gap-1">
                                <Calendar size={14} className="text-space-accent" />
                                {new Date(post.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </div>
                            <div className="flex items-center gap-1">
                                <User size={14} className="text-space-accent" />
                                {post.author}
                            </div>
                            {post.tags && post.tags.map(tag => (
                                <span key={tag} className="flex items-center gap-1 bg-space-800 px-2 py-0.5 rounded text-space-300">
                                    <Tag size={12} /> {tag}
                                </span>
                            ))}
                        </div>

                        {/* Actions */}
                        {isTeacherMode && (
                             <div className="absolute top-8 right-8 flex gap-2">
                                <button onClick={() => startEditing(post)} className="p-2 bg-space-800 text-space-400 hover:text-white rounded hover:bg-space-700"><Edit size={16}/></button>
                                <button onClick={() => handleDelete(post.id)} className="p-2 bg-space-800 text-space-400 hover:text-red-400 rounded hover:bg-red-900/20"><Trash2 size={16}/></button>
                             </div>
                        )}

                        <h2 className="text-2xl md:text-3xl font-bold text-slate-100 mb-6">{post.title}</h2>
                        
                        <div className="prose prose-invert prose-lg max-w-none text-space-300">
                            <SmartText text={post.content} />
                        </div>
                    </div>
                </article>
            ))}
        </div>
    </div>
  );
};
