import React, { useState, useMemo } from 'react';
import { PageConfig } from '../types';
import { appConfig } from '../config';
import { ArticleItem } from '../types'; // Import ArticleItem type

interface BlogPageProps {
    config: PageConfig;
}

const BlogPage: React.FC<BlogPageProps> = ({ config }) => {
    const themeConfig = appConfig.app.theme;
    const [searchTerm, setSearchTerm] = useState('');
    
    // Use articles from config if available
    const articlesSection = config.sections?.find(s => s.type === 'articles');
    // Fix: Explicitly cast rawArticles to ArticleItem[]
    const rawArticles: ArticleItem[] = (articlesSection?.items || []) as ArticleItem[];

    // Filter articles based on search term
    const filteredArticles = useMemo(() => {
        if (!searchTerm) {
            return rawArticles;
        }
        const lowercasedSearchTerm = searchTerm.toLowerCase();
        return rawArticles.filter(article =>
            article.title.toLowerCase().includes(lowercasedSearchTerm) ||
            article.excerpt.toLowerCase().includes(lowercasedSearchTerm)
        );
    }, [rawArticles, searchTerm]);

    // Determine what to display based on filteredArticles and searchTerm
    let contentToDisplay;
    if (filteredArticles.length > 0) {
        contentToDisplay = filteredArticles;
    } else if (searchTerm) {
        contentToDisplay = []; // No results for the current search term
    } else {
        // No search term, and no articles from config, so show placeholder
        contentToDisplay = [{
            title: config.autoUpdate?.placeholderArticle?.title || 'Titre par défaut',
            date: new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' }),
            excerpt: config.autoUpdate?.placeholderArticle?.excerpt || 'Extrait de l\'article du blog sur la peau et la prévention...',
            tag: config.autoUpdate?.placeholderArticle?.tag || 'Prévention'
        }];
    }

    return (
        <div 
            className="w-full max-w-3xl mx-auto bg-white border border-gray-200 rounded-3xl p-6 md:p-10 text-left animate-fade-in shadow-xl"
            style={{ borderRadius: `${themeConfig.radius}px` }}
        >
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4 text-center">{config.title}</h2>
            {config.description && <p className="text-base md:text-lg text-slate-600 mb-8 text-center leading-relaxed">{config.description}</p>}
            
            <div className="mb-10">
                <input
                    type="text"
                    placeholder="Rechercher des articles par titre ou extrait..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-5 py-3 md:px-6 md:py-4 border border-gray-300 bg-white text-slate-900 text-base md:text-lg rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors shadow-sm"
                    aria-label="Rechercher des articles"
                />
            </div>

            <div className="space-y-8">
                {contentToDisplay.length > 0 ? (
                    contentToDisplay.map((post, index) => (
                        <div key={index} 
                             className="p-6 bg-gray-50 border border-gray-200 rounded-2xl shadow-md transition-transform duration-300 hover:scale-[1.01]"
                             style={{ borderRadius: `${themeConfig.radius - 5}px` }}
                        >
                            <h3 className="text-xl md:text-2xl font-semibold mb-2 leading-tight" style={{ color: themeConfig.primaryColor }}>{post.title}</h3>
                            <p className="text-sm md:text-base text-slate-500 mb-3 font-medium flex items-center gap-2">
                                <span className="text-emerald-600">🗓️</span>
                                {post.date || new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })} 
                                <span className="text-emerald-600 ml-3">🏷️</span>
                                <span className="font-semibold text-slate-700">{post.tag}</span>
                            </p>
                            <p className="text-base text-slate-700 leading-relaxed">{post.excerpt}</p>
                        </div>
                    ))
                ) : (
                    <p className="text-center text-slate-600 text-lg md:text-xl py-10">
                        Aucun article ne correspond à votre recherche.
                    </p>
                )}
            </div>
        </div>
    );
};

export default BlogPage;