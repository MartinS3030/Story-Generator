'use client';

import { useState, useEffect, useCallback } from 'react';
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
  Make sure that the story makes logical sense and keep it within 500 words.
  Can you please return the story in this json format please: { "title": (string, title of the story), "paragraphs": (array of strings for each paragraph of the story) }
`;

const PLOT_TWIST_TEXT = "Add an unexpected plot twist.";

const APP_DOMAIN = process.env.NEXT_PUBLIC_APP_DOMAIN;

export default function StoryGeneratorPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
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

  const checkUser = useCallback(async () => {
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
        router.push('/authenticate');
      }
    } catch (error) {
      console.error("Error:", error);
      router.push('/authenticate');
    }
  }, [router]);

  const getApiCalls = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    checkUser();
    getApiCalls();
  }, [checkUser, getApiCalls]);

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

      // This is for testing without the API so I can save money.
      
      // const parsedData = {
      //   "title": "The Clockmaker's Secret",
      //   "paragraphs": [
      //     "In a misty Victorian town nestled between the hills, time moved differently. The fog rolled in thick every morning, muffling the clinks and ticks that spilled from an old clockmaker's shop on the edge of Rosewood Street.",
      //     "The main character, Elara Wren, was a meticulous and reclusive clockmaker, known for crafting pieces that kept perfect time even when the rest of the world seemed to falter. Her role in the town was modest, yet people often whispered about the strange energies surrounding her workbench.",
      //     "One stormy evening, a wealthy nobleman visited her shop, requesting a clock that could mark more than just hours—it needed to record fate itself. Intrigued and disturbed, Elara accepted, diving into blueprints and long-forgotten books.",
      //     "As she built the clock, time around her bent—flowers bloomed in the dead of winter, and townsfolk experienced déjà vu. The deeper Elara went, the more she realized that the gears of her creation mirrored something ancient and powerful.",
      //     "The plot twist came when Elara discovered that the clock wasn't meant to record fate—it was meant to rewrite it. With every tick, history shifted. She had unknowingly been chosen by a hidden society to resurrect the lost art of temporal manipulation.",
      //     "Faced with the decision to continue building the device or dismantle it forever, Elara chose a third path. She locked it away, entrusting the key to a child who would one day face the same choice. The town returned to normal—mostly—but Rosewood Street never quite ticked the same again."
      //   ]
      // };
      
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

  const handleSaveStory = async () => {
    if (!generatedStory) return;

    try {
      setIsSaving(true);
      
      const storyContent = generatedStory.paragraphs.join('\n\n');
      const tags = [formData.genre, formData.tone, formData.setting].filter(Boolean);

      const response = await fetch(`${APP_DOMAIN}/api/v1/createStory`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: generatedStory.title,
          content: storyContent,
          tags: tags
        }),
      });

      if (!response.ok) {
        throw new Error(USER_STRINGS.storySaveFailed);
      }

      await response.json(); // Process the response but don't store it since it's not used
      alert(USER_STRINGS.storySavedSuccess);
    } catch (error) {
      alert(USER_STRINGS.storySaveError + (error as Error).message);
    } finally {
      setIsSaving(false);
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
    <div className="min-h-screen bg-warm-cream">
      {userData && (
        <Navbar
          apicalls={apiCalls}
          id={userData.id}
          username={userData.username}
          onUsernameUpdate={handleUsernameUpdate}
        />
      )}

      {isLoading && (
        <div className="fixed inset-0 bg-deep-mahogany bg-opacity-80 flex items-center justify-center z-50">
          <div className="flex flex-col items-center text-warm-cream">
            <div className="w-16 h-16 border-4 border-warm-beige border-t-golden rounded-full animate-spin mb-4"></div>
            <p className="text-lg font-medium">{USER_STRINGS.loading}</p>
          </div>
        </div>
      )}

      <div className="py-8 px-4">
        {apiCalls === 0 && (
          <div className="max-w-2xl mx-auto mb-6">
            <div className="bg-warm-beige border-2 border-light-gold text-rich-brown px-6 py-4 rounded-lg shadow-md" role="alert">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-3 text-saddle-brown" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <p className="font-medium">{USER_STRINGS.alerts.noApiCalls}</p>
              </div>
            </div>
          </div>
        )}

        <div className="text-center mb-12 pt-8">
          <h1 className="text-5xl font-bold text-deep-mahogany mb-4 font-dancing">
            {USER_STRINGS.pageTitle}
          </h1>
        </div>

        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-2xl border border-warm-beige overflow-hidden">
          <div className="bg-gradient-to-r from-saddle-brown to-rich-brown p-6">
            <h2 className="text-2xl font-bold text-warm-cream text-center">{USER_STRINGS.storyConfigurationTitle}</h2>
          </div>
          
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="genre" className="block text-sm font-semibold text-deep-mahogany mb-3">
                  {USER_STRINGS.genre.label}
                </label>
                <select
                  id="genre"
                  name="genre"
                  value={formData.genre}
                  onChange={handleInputChange}
                  required
                  className="input-custom w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-golden transition-all duration-200"
                >
                  <option value="">{USER_STRINGS.genre.placeholder}</option>
                  {renderOptions(USER_STRINGS.genre.options)}
                </select>
              </div>

              <div>
                <label htmlFor="characterName" className="block text-sm font-semibold text-deep-mahogany mb-3">
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
                  className="input-custom w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-golden transition-all duration-200"
                />
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-semibold text-deep-mahogany mb-3">
                  {USER_STRINGS.role.label}
                </label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  required
                  className="input-custom w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-golden transition-all duration-200"
                >
                  <option value="">{USER_STRINGS.role.placeholder}</option>
                  {renderOptions(USER_STRINGS.role.options)}
                </select>
              </div>

              <div>
                <label htmlFor="setting" className="block text-sm font-semibold text-deep-mahogany mb-3">
                  {USER_STRINGS.setting.label}
                </label>
                <select
                  id="setting"
                  name="setting"
                  value={formData.setting}
                  onChange={handleInputChange}
                  required
                  className="input-custom w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-golden transition-all duration-200"
                >
                  <option value="">{USER_STRINGS.setting.placeholder}</option>
                  {renderOptions(USER_STRINGS.setting.options)}
                </select>
              </div>

              <div>
                <label htmlFor="tone" className="block text-sm font-semibold text-deep-mahogany mb-3">
                  {USER_STRINGS.tone.label}
                </label>
                <select
                  id="tone"
                  name="tone"
                  value={formData.tone}
                  onChange={handleInputChange}
                  required
                  className="input-custom w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-golden transition-all duration-200"
                >
                  <option value="">{USER_STRINGS.tone.placeholder}</option>
                  {renderOptions(USER_STRINGS.tone.options)}
                </select>
              </div>

              <div className="bg-warm-beige p-4 rounded-lg border border-light-gold">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="plotTwist"
                    name="plotTwist"
                    checked={formData.plotTwist}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-golden border-2 border-saddle-brown rounded focus:ring-golden focus:ring-2"
                  />
                  <label htmlFor="plotTwist" className="text-sm font-semibold text-rich-brown">
                    {USER_STRINGS.plotTwist.checkboxLabel}
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || apiCalls === 0}
                className="btn-primary w-full font-semibold py-4 px-6 rounded-lg transition-all duration-200 ease-in-out transform hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-golden focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-warm-cream border-t-transparent rounded-full animate-spin mr-3"></div>
                    {USER_STRINGS.generating}
                  </div>
                ) : (
                  USER_STRINGS.generateButton
                )}
              </button>
            </form>
          </div>
        </div>

        {generatedStory && (
          <div className="max-w-4xl mx-auto mt-12">
            <div className="bg-saddle-brown rounded-t-xl p-8 text-warm-cream shadow-2xl relative">
              <button
                onClick={handleSaveStory}
                disabled={isSaving}
                className="absolute top-4 right-4 flex items-center space-x-2 bg-golden hover:bg-light-gold text-deep-mahogany px-4 py-2 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-deep-mahogany border-t-transparent rounded-full animate-spin"></div>
                    <span>{USER_STRINGS.saving}</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6a1 1 0 10-2 0v5.586l-1.293-1.293zM5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                    </svg>
                    <span>{USER_STRINGS.saveStory}</span>
                  </>
                )}
              </button>

              <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-golden bg-opacity-20 rounded-full mb-6 border-2 border-golden">
                  <svg className="w-10 h-10 text-golden" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                  </svg>
                </div>
                <h2 className="text-4xl font-bold mb-4 font-dancing">
                  {generatedStory.title}
                </h2>
              </div>
            </div>

            <div className="bg-white rounded-b-xl shadow-2xl border-2 border-warm-beige">
              <div className="p-8 md:p-12">
                <div className="prose prose-lg max-w-none">
                  {generatedStory.paragraphs.map((paragraph, index) => (
                    <div key={index} className="mb-8 last:mb-0">
                      {index === 0 && (
                        <div className="float-left text-7xl font-serif text-golden leading-none pr-4 pt-2 drop-shadow-sm">
                          {paragraph.charAt(0)}
                        </div>
                      )}
                      <p className={`text-deep-mahogany leading-relaxed text-lg ${index === 0 ? 'first-letter:hidden' : ''}`}>
                        {index === 0 ? paragraph.slice(1) : paragraph}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-center">
              <button
                onClick={() => setGeneratedStory(null)}
                className="flex items-center space-x-3 bg-rich-brown hover:bg-deep-mahogany text-warm-cream px-6 py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-medium"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                <span>{USER_STRINGS.createNewStory}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}