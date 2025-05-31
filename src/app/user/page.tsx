'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../components/navbar';
import { USER_STRINGS } from '../lang/en/messages';

interface StoryData {
  title: string;
  paragraphs: string[];
}

interface UserData {
  id: string;
  username: string;
}

const STORY_PROMPT_TEMPLATE = `
  Write a {tone} {genre} story set in a {setting}. The main character is {characterName}, who plays the role of a {role}. {plotTwistText}
  Can you please return the story in this json format please: { "title": (string, title of the story), "paragraphs": (array of strings for each paragraph of the story) }
`;

const PLOT_TWIST_TEXT = "Add an unexpected plot twist.";

const APP_DOMAIN = process.env.NEXT_PUBLIC_APP_DOMAIN;

export default function StoryGeneratorPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [apiCalls, setApiCalls] = useState<number>(0);
  const [generatedStory, setGeneratedStory] = useState<StoryData | null>(null);
  const [formData, setFormData] = useState({
    genre: '',
    characterName: '',
    role: '',
    setting: '',
    tone: '',
    plotTwist: false
  });
  const router = useRouter();

  useEffect(() => {
    checkUser();
    getApiCalls();
  }, []);

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
        console.log("else")
        router.push('/login');
      }
    } catch (error) {
      console.error("Error:", error);
      router.push('/login');
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

  const handleUsernameUpdate = (newUsername: string) => {
    setUserData(prev => prev ? { ...prev, username: newUsername } : null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const validateCharacterName = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^A-Za-z\s]/g, "");
    setFormData(prev => ({ ...prev, characterName: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { genre, characterName, role, setting, tone, plotTwist } = formData;
    const plotTwistText = plotTwist ? PLOT_TWIST_TEXT : "";
    
    const prompt = STORY_PROMPT_TEMPLATE
      .replace("{tone}", tone.toLowerCase())
      .replace("{genre}", genre.toLowerCase())
      .replace("{setting}", setting.toLowerCase())
      .replace("{characterName}", characterName)
      .replace("{role}", role.toLowerCase())
      .replace("{plotTwistText}", plotTwistText);

    try {
      setIsLoading(true);

      const response = await fetch(`${APP_DOMAIN}/api/v1/generate`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error(USER_STRINGS.errors.storyGeneration);
      }

      const data = await response.json();
      const parsedData = JSON.parse(data.generatedText);
      
      setGeneratedStory({
        title: parsedData.title,
        paragraphs: parsedData.paragraphs
      });

      if (apiCalls > 0) {
        setApiCalls(prev => prev - 1);
      }
    } catch (error) {
      alert(USER_STRINGS.errors.generic + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const renderOptions = (options: Record<string, string>) => {
    return Object.entries(options).map(([value, text]) => (
      <option key={value} value={text}>
        {text}
      </option>
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {userData && (
        <Navbar
          apicalls={apiCalls}
          id={userData.id}
          username={userData.username}
          onUsernameUpdate={handleUsernameUpdate}
        />
      )}

      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="flex flex-col items-center text-white">
            <div className="w-16 h-16 border-4 border-gray-300 border-t-green-500 rounded-full animate-spin mb-4"></div>
            <p className="text-lg">{USER_STRINGS.loading}</p>
          </div>
        </div>
      )}

      <div className="py-8 px-4">
        {apiCalls === 0 && (
          <div className="max-w-2xl mx-auto mb-6">
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg" role="alert">
              <p>{USER_STRINGS.alerts.noApiCalls}</p>
            </div>
          </div>
        )}

        <h1 className="text-4xl font-bold text-center text-gray-800 mb-8 pt-8">
          {USER_STRINGS.pageTitle}
        </h1>

        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="genre" className="block text-sm font-medium text-gray-700 mb-2">
                {USER_STRINGS.genre.label}
              </label>
              <select
                id="genre"
                name="genre"
                value={formData.genre}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">{USER_STRINGS.genre.placeholder}</option>
                {renderOptions(USER_STRINGS.genre.options)}
              </select>
            </div>

            <div>
              <label htmlFor="characterName" className="block text-sm font-medium text-gray-700 mb-2">
                {USER_STRINGS.characterName.label}
              </label>
              <input
                type="text"
                id="characterName"
                name="characterName"
                value={formData.characterName}
                onChange={validateCharacterName}
                pattern={USER_STRINGS.characterName.pattern}
                title={USER_STRINGS.characterName.title}
                maxLength={USER_STRINGS.characterName.maxLength}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                {USER_STRINGS.role.label}
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">{USER_STRINGS.role.placeholder}</option>
                {renderOptions(USER_STRINGS.role.options)}
              </select>
            </div>

            <div>
              <label htmlFor="setting" className="block text-sm font-medium text-gray-700 mb-2">
                {USER_STRINGS.setting.label}
              </label>
              <select
                id="setting"
                name="setting"
                value={formData.setting}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">{USER_STRINGS.setting.placeholder}</option>
                {renderOptions(USER_STRINGS.setting.options)}
              </select>
            </div>

            <div>
              <label htmlFor="tone" className="block text-sm font-medium text-gray-700 mb-2">
                {USER_STRINGS.tone.label}
              </label>
              <select
                id="tone"
                name="tone"
                value={formData.tone}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">{USER_STRINGS.tone.placeholder}</option>
                {renderOptions(USER_STRINGS.tone.options)}
              </select>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="plotTwist"
                name="plotTwist"
                checked={formData.plotTwist}
                onChange={handleInputChange}
                className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
              />
              <label htmlFor="plotTwist" className="text-sm font-medium text-gray-700">
                {USER_STRINGS.plotTwist.checkboxLabel}
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading || apiCalls === 0}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-md transition duration-200 ease-in-out transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              {isLoading ? 'Generating...' : USER_STRINGS.generateButton}
            </button>
          </form>
        </div>

        {generatedStory && (
          <div className="max-w-2xl mx-auto mt-8 bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              {generatedStory.title}
            </h2>
            <div className="space-y-4">
              {generatedStory.paragraphs.map((paragraph, index) => (
                <p key={index} className="text-gray-700 leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}