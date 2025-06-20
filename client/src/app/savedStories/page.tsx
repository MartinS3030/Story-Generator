'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../components/navbar';
import { SAVED_STORIES_STRINGS } from '../lang/en/messages'

interface Story {
  id: number;
  user_id: number;
  title: string;
  content: string;
  created_at: string;
  tags: string[];
  is_favorite?: boolean;
}

interface UserData {
  id: string;
  username: string;
}

const APP_DOMAIN = process.env.NEXT_PUBLIC_APP_DOMAIN;

export default function SavedStoriesPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [apiCalls, setApiCalls] = useState<number>(0);
  const [stories, setStories] = useState<Story[]>([]);
  const [filteredStories, setFilteredStories] = useState<Story[]>([]);
  const [expandedStories, setExpandedStories] = useState<Set<number>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'alphabetical'>('newest');
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkUser();
    getApiCalls();
  }, []);

  useEffect(() => {
    if (userData) {
      fetchStories();
    }
  }, [userData]);

  useEffect(() => {
    applyFilters();
  }, [stories, searchTerm, selectedTags, dateRange, sortBy]);

  const checkUser = async () => {
    try {
      const response = await fetch(`${APP_DOMAIN}/api/v1/checkUser`, {
        method: "GET",
        credentials: "include",
      });

      if (response.status === 200) {
        const data = await response.json();
        setUserData({ id: data.id, username: data.username });
      } else {
        router.push('/authenticate');
      }
    } catch (error) {
      console.error("Error:", error);
      router.push('/authenticate');
    }
  };

  const getApiCalls = async () => {
    try {
      const response = await fetch(`${APP_DOMAIN}/api/v1/getApiCalls`, {
        method: "GET",
        credentials: "include",
      });

      if (response.status === 200) {
        const data = await response.json();
        setApiCalls(data.apiCalls);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const fetchStories = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${APP_DOMAIN}/api/v1/getStories`, {
        method: "GET",
        credentials: "include",
      });

      if (response.status === 200) {
        const data = await response.json();
        setStories(data);
        
        const allTags: string[] = [];
        data.forEach((story: Story) => {
          if (story.tags && Array.isArray(story.tags)) {
            story.tags.forEach((tag) => {
              if (typeof tag === 'string') {
                allTags.push(tag);
              }
            });
          }
        });
        const uniqueTags = Array.from(new Set(allTags)).sort();
        setAvailableTags(uniqueTags);
      } else {
        console.error(SAVED_STORIES_STRINGS.FAILED_TO_FETCH);
      }
    } catch (error) {
      console.error(SAVED_STORIES_STRINGS.CONSOLE.ERROR_FETCHING, error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteStory = async (storyId: number) => {
    if (!deleteConfirmId) {
      setDeleteConfirmId(storyId);
      return;
    }

    if (deleteConfirmId !== storyId) {
      setDeleteConfirmId(storyId);
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`${APP_DOMAIN}/api/v1/deleteStory/${storyId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.status === 200) {
        setStories(prev => prev.filter(story => story.id !== storyId));
        setDeleteConfirmId(null);
        console.log(SAVED_STORIES_STRINGS.CONSOLE.STORY_DELETED);
      } else {
        const errorData = await response.json();
        console.error(SAVED_STORIES_STRINGS.FAILED_TO_DELETE, errorData.message);
      }
    } catch (error) {
      console.error(SAVED_STORIES_STRINGS.CONSOLE.ERROR_DELETING, error);
    } finally {
      setIsDeleting(false);
      setDeleteConfirmId(null);
    }
  };

  const handleToggleFavorite = async (storyId: number, currentFavoriteStatus: boolean) => {
    const newFavoriteStatus = !currentFavoriteStatus;
    
    try {
      const response = await fetch(`${APP_DOMAIN}/api/v1/favorite/${storyId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ isFavorite: newFavoriteStatus }),
      });

      if (response.status === 200) {
        setStories(prev => prev.map(story => 
          story.id === storyId 
            ? { ...story, is_favorite: newFavoriteStatus }
            : story
        ));
        const action = newFavoriteStatus ? SAVED_STORIES_STRINGS.FAVORITE_ADDED : SAVED_STORIES_STRINGS.FAVORITE_REMOVED;
        console.log(SAVED_STORIES_STRINGS.CONSOLE.FAVORITE_UPDATED(`${action} ${SAVED_STORIES_STRINGS.FAVORITES_TEXT}`));
      } else {
        const errorData = await response.json();
        console.error(SAVED_STORIES_STRINGS.FAILED_TO_UPDATE_FAVORITE, errorData.message);
      }
    } catch (error) {
      console.error(SAVED_STORIES_STRINGS.CONSOLE.ERROR_FAVORITE, error);
    }
  };

  const handleUsernameUpdate = (newUsername: string) => {
    setUserData(prev => prev ? { ...prev, username: newUsername } : null);
  };

  const applyFilters = () => {
    let filtered = [...stories];

    if (searchTerm) {
      filtered = filtered.filter(story =>
        story.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedTags.length > 0) {
      filtered = filtered.filter(story =>
        selectedTags.some(tag => story.tags?.includes(tag))
      );
    }

    if (dateRange.start || dateRange.end) {
      filtered = filtered.filter(story => {
        const storyDate = new Date(story.created_at);
        const startDate = dateRange.start ? new Date(dateRange.start) : null;
        const endDate = dateRange.end ? new Date(dateRange.end + 'T23:59:59') : null;

        if (startDate && endDate) {
          return storyDate >= startDate && storyDate <= endDate;
        } else if (startDate) {
          return storyDate >= startDate;
        } else if (endDate) {
          return storyDate <= endDate;
        }
        return true;
      });
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'alphabetical':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    setFilteredStories(filtered);
  };

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedTags([]);
    setDateRange({ start: '', end: '' });
    setSortBy('newest');
  };

  const toggleStoryExpansion = (storyId: number) => {
    setExpandedStories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(storyId)) {
        newSet.delete(storyId);
      } else {
        newSet.add(storyId);
      }
      return newSet;
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPreviewText = (content: string, maxLength: number = 200) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength).trim() + '...';
  };

  const navigateToGenerator = () => {
    router.push('/user');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-warm-cream">
        {userData && (
          <Navbar
            apicalls={apiCalls}
            id={userData.id}
            username={userData.username}
            onUsernameUpdate={handleUsernameUpdate}
          />
        )}
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center text-deep-mahogany">
            <div className="w-16 h-16 border-4 border-saddle-brown border-t-golden rounded-full animate-spin mb-4"></div>
            <p className="text-lg font-medium">{SAVED_STORIES_STRINGS.LOADING_MESSAGE}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-cream">
      {userData && (
        <Navbar
          apicalls={apiCalls}
          id={userData.id}
          username={userData.username}
          onUsernameUpdate={handleUsernameUpdate}
        />
      )}

      <div className="py-8 px-4">
        <div className="text-center mb-12 pt-8">
          <h1 className="text-4xl md:text-5xl font-bold text-deep-mahogany mb-4 font-dancing">
            {SAVED_STORIES_STRINGS.PAGE_TITLE}
          </h1>
        </div>

        {filteredStories.length === 0 && stories.length === 0 ? (
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white rounded-xl shadow-2xl border border-warm-beige p-12">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-warm-beige rounded-full mb-8">
                <svg className="w-12 h-12 text-saddle-brown" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-deep-mahogany mb-4">{SAVED_STORIES_STRINGS.NO_STORIES_TITLE}</h2>
              <p className="text-rich-brown mb-8 text-lg">
                {SAVED_STORIES_STRINGS.NO_STORIES_MESSAGE}
              </p>
              <button
                onClick={navigateToGenerator}
                className="inline-flex items-center space-x-3 bg-gradient-to-r from-saddle-brown to-rich-brown hover:from-rich-brown hover:to-deep-mahogany text-warm-cream px-8 py-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-medium text-lg"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                <span>{SAVED_STORIES_STRINGS.CREATE_FIRST_STORY_BUTTON}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg border border-warm-beige p-6 mb-8">
              <div className="mb-6">
                <label htmlFor="search" className="block text-sm font-semibold text-deep-mahogany mb-3">
                  {SAVED_STORIES_STRINGS.SEARCH_LABEL}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={SAVED_STORIES_STRINGS.SEARCH_PLACEHOLDER}
                    className="w-full px-4 py-3 pl-12 border-2 border-warm-beige rounded-lg focus:ring-2 focus:ring-golden focus:border-golden transition-all duration-200"
                  />
                  <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-saddle-brown" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-deep-mahogany mb-3">
                    {SAVED_STORIES_STRINGS.FILTER_BY_TAGS_LABEL}
                  </label>
                  <div className="max-h-32 overflow-y-auto border border-warm-beige rounded-lg p-3 bg-warm-cream">
                    {availableTags.length > 0 ? (
                      <div className="space-y-2">
                        {availableTags.map(tag => (
                          <label key={tag} className="flex items-center space-x-2 cursor-pointer hover:bg-warm-beige rounded px-2 py-1 transition-colors duration-200">
                            <input
                              type="checkbox"
                              checked={selectedTags.includes(tag)}
                              onChange={() => handleTagToggle(tag)}
                              className="w-4 h-4 text-golden border-2 border-saddle-brown rounded focus:ring-golden focus:ring-2"
                            />
                            <span className="text-sm text-rich-brown">{tag}</span>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-saddle-brown">{SAVED_STORIES_STRINGS.NO_TAGS_AVAILABLE}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-deep-mahogany mb-3">
                    {SAVED_STORIES_STRINGS.DATE_RANGE_LABEL}
                  </label>
                  <div className="space-y-3">
                    <div>
                      <label htmlFor="startDate" className="block text-xs text-saddle-brown mb-1">{SAVED_STORIES_STRINGS.DATE_FROM_LABEL}</label>
                      <input
                        type="date"
                        id="startDate"
                        value={dateRange.start}
                        onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                        className="w-full px-3 py-2 border-2 border-warm-beige rounded-lg focus:ring-2 focus:ring-golden focus:border-golden transition-all duration-200 text-sm"
                      />
                    </div>
                    <div>
                      <label htmlFor="endDate" className="block text-xs text-saddle-brown mb-1">{SAVED_STORIES_STRINGS.DATE_TO_LABEL}</label>
                      <input
                        type="date"
                        id="endDate"
                        value={dateRange.end}
                        onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                        className="w-full px-3 py-2 border-2 border-warm-beige rounded-lg focus:ring-2 focus:ring-golden focus:border-golden transition-all duration-200 text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="sortBy" className="block text-sm font-semibold text-deep-mahogany mb-3">
                    {SAVED_STORIES_STRINGS.SORT_BY_LABEL}
                  </label>
                  <select
                    id="sortBy"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'alphabetical')}
                    className="w-full px-4 py-3 border-2 border-warm-beige rounded-lg focus:ring-2 focus:ring-golden focus:border-golden transition-all duration-200 bg-white"
                  >
                    <option value="newest">{SAVED_STORIES_STRINGS.SORT_OPTIONS.NEWEST}</option>
                    <option value="oldest">{SAVED_STORIES_STRINGS.SORT_OPTIONS.OLDEST}</option>
                    <option value="alphabetical">{SAVED_STORIES_STRINGS.SORT_OPTIONS.ALPHABETICAL}</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0">
                <div className="text-sm text-saddle-brown">
                  {SAVED_STORIES_STRINGS.SHOWING_RESULTS(filteredStories.length, stories.length)}
                </div>
                <button
                  onClick={clearFilters}
                  className="flex cursor-pointer items-center space-x-2 text-saddle-brown hover:text-rich-brown transition-colors duration-200 font-medium"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span>{SAVED_STORIES_STRINGS.CLEAR_ALL_FILTERS}</span>
                </button>
              </div>
            </div>

            {filteredStories.length === 0 && stories.length > 0 && (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-warm-beige rounded-full mb-4">
                  <svg className="w-8 h-8 text-saddle-brown" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-deep-mahogany mb-2">{SAVED_STORIES_STRINGS.NO_RESULTS_TITLE}</h3>
                <p className="text-rich-brown mb-4">{SAVED_STORIES_STRINGS.NO_RESULTS_MESSAGE}</p>
                <button
                  onClick={clearFilters}
                  className="text-saddle-brown hover:text-rich-brown font-medium cursor-pointer"
                >
                  {SAVED_STORIES_STRINGS.CLEAR_FILTERS_SUGGESTION}
                </button>
              </div>
            )}

            {filteredStories.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                {filteredStories.map((story) => {
                const isExpanded = expandedStories.has(story.id);
                const contentToShow = isExpanded ? story.content : getPreviewText(story.content);
                const isFavorite = story.is_favorite || false;
                
                return (
                  <div key={story.id} className="bg-white rounded-xl shadow-lg border border-warm-beige hover:shadow-xl transition-all duration-300 overflow-hidden group">
                    <div className="bg-gradient-to-r from-saddle-brown to-rich-brown p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-warm-cream line-clamp-2 group-hover:text-golden transition-colors duration-200">
                            {story.title}
                          </h3>
                          <p className="text-warm-beige text-sm mt-1">
                            {formatDate(story.created_at)}
                          </p>
                        </div>
                        {isFavorite && (
                          <svg className="w-5 h-5 text-golden flex-shrink-0 ml-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="prose prose-sm max-w-none mb-4">
                        <p className="text-deep-mahogany leading-relaxed whitespace-pre-line">
                          {contentToShow}
                        </p>
                      </div>

                      {story.tags && story.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {story.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="inline-block bg-warm-beige text-rich-brown px-3 py-1 rounded-full text-xs font-medium border border-light-gold"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-4 border-t border-warm-beige">
                        <button
                          onClick={() => toggleStoryExpansion(story.id)}
                          className="flex items-center space-x-2 text-saddle-brown hover:text-rich-brown transition-colors duration-200 font-medium"
                        >
                          <span>{isExpanded ? SAVED_STORIES_STRINGS.SHOW_LESS : SAVED_STORIES_STRINGS.READ_MORE}</span>
                          <svg 
                            className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} 
                            fill="currentColor" 
                            viewBox="0 0 20 20"
                          >
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>

                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => handleToggleFavorite(story.id, isFavorite)}
                            className={`p-2 transition-colors duration-200 hover:bg-warm-beige rounded-full ${
                              isFavorite 
                                ? 'text-red-500 hover:text-red-600' 
                                : 'text-saddle-brown hover:text-golden'
                            }`}
                            title={isFavorite ? SAVED_STORIES_STRINGS.REMOVE_FROM_FAVORITES : SAVED_STORIES_STRINGS.ADD_TO_FAVORITES}
                          >
                            <svg className="w-5 h-5" fill={isFavorite ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                          </button>

                          <button
                            onClick={() => handleDeleteStory(story.id)}
                            disabled={isDeleting}
                            className={`p-2 transition-colors duration-200 rounded-full ${
                              deleteConfirmId === story.id
                                ? 'bg-red-100 text-red-600 hover:bg-red-200'
                                : 'text-saddle-brown hover:text-red-600 hover:bg-red-50'
                            } ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''}`}
                            title={deleteConfirmId === story.id ? SAVED_STORIES_STRINGS.CONFIRM_DELETE : SAVED_STORIES_STRINGS.DELETE_STORY}
                          >
                            {isDeleting && deleteConfirmId === story.id ? (
                              <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>

                      {deleteConfirmId === story.id && (
                        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-sm text-red-700 mb-2">
                            {SAVED_STORIES_STRINGS.DELETE_CONFIRMATION_MESSAGE}
                          </p>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleDeleteStory(story.id)}
                              disabled={isDeleting}
                              className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50"
                            >
                              {isDeleting ? 'Deleting...' : 'Yes, Delete'}
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(null)}
                              className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400"
                            >
                              {SAVED_STORIES_STRINGS.DELETE_CANCEL_BUTTON}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              </div>
            )}

            {filteredStories.length > 0 && (
              <div className="mt-12 text-center">
                <button
                  onClick={navigateToGenerator}
                  className="inline-flex items-center space-x-3 bg-gradient-to-r from-saddle-brown to-rich-brown hover:from-rich-brown hover:to-deep-mahogany text-warm-cream px-8 py-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-medium text-lg"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  <span>{SAVED_STORIES_STRINGS.CREATE_NEW_STORY_BUTTON}</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}