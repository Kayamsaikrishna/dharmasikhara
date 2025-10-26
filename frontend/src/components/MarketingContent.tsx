import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface HeroContent {
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
}

interface Feature {
  title: string;
  description: string;
  icon: string;
}

interface Testimonial {
  name: string;
  role: string;
  content: string;
  rating: number;
}

interface Stats {
  users: string;
  scenarios: string;
  institutions: string;
  certifications: string;
}

interface CTA {
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
}

interface Banner {
  id: string;
  title: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  backgroundColor: string;
  textColor: string;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  priority: string;
}

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  category: string;
  readTime: string;
  image: string;
}

interface Resource {
  id: string;
  title: string;
  description: string;
  type: string;
  size: string;
  downloadLink: string;
}

interface Video {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  duration: string;
  embedUrl: string;
}

interface MarketingContent {
  hero: HeroContent;
  features: Feature[];
  testimonials: Testimonial[];
  stats: Stats;
  cta: CTA;
}

interface PromotionalContent {
  banners: Banner[];
  announcements: Announcement[];
}

interface EducationalContent {
  blogPosts: BlogPost[];
  resources: Resource[];
  videos: Video[];
}

const MarketingContent: React.FC = () => {
  const { t } = useLanguage();
  const [marketingContent, setMarketingContent] = useState<MarketingContent | null>(null);
  const [promotionalContent, setPromotionalContent] = useState<PromotionalContent | null>(null);
  const [educationalContent, setEducationalContent] = useState<EducationalContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch marketing content
  useEffect(() => {
    const fetchMarketingContent = async () => {
      try {
        setLoading(true);
        
        // Fetch marketing content
        const marketingResponse = await fetch('/api/marketing/content');
        const marketingData = await marketingResponse.json();
        
        if (marketingData.success) {
          setMarketingContent(marketingData.data);
        } else {
          setError(marketingData.message || 'Failed to fetch marketing content');
        }
        
        // Fetch promotional content
        const promotionalResponse = await fetch('/api/marketing/promotional');
        const promotionalData = await promotionalResponse.json();
        
        if (promotionalData.success) {
          setPromotionalContent(promotionalData.data);
        }
        
        // Fetch educational content
        const educationalResponse = await fetch('/api/marketing/educational');
        const educationalData = await educationalResponse.json();
        
        if (educationalData.success) {
          setEducationalContent(educationalData.data);
        }
      } catch (err) {
        setError('Failed to connect to the server');
        console.error('Fetch marketing content error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMarketingContent();
  }, []);

  const handleEngagement = async (contentType: string, contentId: string, action: string) => {
    try {
      await fetch('/api/marketing/track-engagement', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ contentType, contentId, action })
      });
    } catch (err) {
      console.error('Track engagement error:', err);
    }
  };

  const getRatingStars = (rating: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-5 h-5 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-700 dark:text-red-300">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      {marketingContent && (
        <>
          <div className="relative bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl overflow-hidden mb-12">
            <div className="absolute inset-0 bg-black opacity-10"></div>
            <div className="relative max-w-7xl mx-auto px-4 py-16 sm:px-6 sm:py-24 lg:px-8 lg:py-32">
              <div className="max-w-3xl">
                <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
                  {marketingContent.hero.title}
                </h1>
                <p className="mt-6 text-xl text-blue-100">
                  {marketingContent.hero.subtitle}
                </p>
                <div className="mt-10">
                  <a
                    href={marketingContent.hero.ctaLink}
                    onClick={() => handleEngagement('hero', 'cta', 'click')}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 transition-colors"
                  >
                    {marketingContent.hero.ctaText}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{marketingContent.stats.users}</p>
              <p className="mt-1 text-gray-600 dark:text-gray-400">Users</p>
            </div>
            <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{marketingContent.stats.scenarios}</p>
              <p className="mt-1 text-gray-600 dark:text-gray-400">Scenarios</p>
            </div>
            <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{marketingContent.stats.institutions}</p>
              <p className="mt-1 text-gray-600 dark:text-gray-400">Institutions</p>
            </div>
            <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{marketingContent.stats.certifications}</p>
              <p className="mt-1 text-gray-600 dark:text-gray-400">Certifications</p>
            </div>
          </div>

          {/* Features Section */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
              Why Choose DharmaSikhara?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {marketingContent.features.map((feature, index) => (
                <div 
                  key={index} 
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
                >
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Testimonials Section */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
              What Our Users Say
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {marketingContent.testimonials.map((testimonial, index) => (
                <div 
                  key={index} 
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
                >
                  {getRatingStars(testimonial.rating)}
                  <p className="mt-4 text-gray-700 dark:text-gray-300 italic">
                    "{testimonial.content}"
                  </p>
                  <div className="mt-6 flex items-center">
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {testimonial.name}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Promotional Banners */}
          {promotionalContent && promotionalContent.banners.length > 0 && (
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">
                Special Offers
              </h2>
              <div className="space-y-6">
                {promotionalContent.banners.map((banner) => (
                  <div 
                    key={banner.id}
                    className={`rounded-lg p-6 text-${banner.textColor} relative overflow-hidden`}
                    style={{ backgroundColor: banner.backgroundColor === 'blue' ? '#3B82F6' : '#10B981' }}
                  >
                    <div className="relative z-10">
                      <h3 className="text-2xl font-bold mb-2">{banner.title}</h3>
                      <p className="mb-4 max-w-2xl">{banner.description}</p>
                      <a
                        href={banner.ctaLink}
                        onClick={() => handleEngagement('banner', banner.id, 'click')}
                        className={`inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-${banner.backgroundColor === 'blue' ? 'blue' : 'green'}-700 bg-white hover:bg-${banner.backgroundColor === 'blue' ? 'blue' : 'green'}-50 transition-colors`}
                      >
                        {banner.ctaText}
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Educational Content */}
          {educationalContent && (
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
                Educational Resources
              </h2>
              
              {/* Blog Posts */}
              <div className="mb-12">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Latest Blog Posts
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {educationalContent.blogPosts.map((post) => (
                    <div 
                      key={post.id} 
                      className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                    >
                      <img 
                        src={post.image} 
                        alt={post.title} 
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-6">
                        <div className="flex justify-between items-center mb-2">
                          <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full dark:bg-blue-900/30 dark:text-blue-200">
                            {post.category}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {post.readTime}
                          </span>
                        </div>
                        <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                          {post.title}
                        </h4>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                          {post.excerpt}
                        </p>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            by {post.author} • {post.date}
                          </span>
                          <button
                            onClick={() => handleEngagement('blog', post.id, 'read')}
                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                          >
                            Read More →
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Resources */}
              <div className="mb-12">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Downloadable Resources
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {educationalContent.resources.map((resource) => (
                    <div 
                      key={resource.id} 
                      className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
                    >
                      <div className="flex items-center mb-4">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mr-3">
                          <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">{resource.title}</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{resource.type} • {resource.size}</p>
                        </div>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                        {resource.description}
                      </p>
                      <a
                        href={resource.downloadLink}
                        onClick={() => handleEngagement('resource', resource.id, 'download')}
                        className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        Download
                        <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      </a>
                    </div>
                  ))}
                </div>
              </div>

              {/* Videos */}
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Educational Videos
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {educationalContent.videos.map((video) => (
                    <div 
                      key={video.id} 
                      className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                    >
                      <div className="relative">
                        <img 
                          src={video.thumbnail} 
                          alt={video.title} 
                          className="w-full h-48 object-cover"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                          <button
                            onClick={() => handleEngagement('video', video.id, 'play')}
                            className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors"
                          >
                            <svg className="w-6 h-6 text-white ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </button>
                        </div>
                        <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                          {video.duration}
                        </div>
                      </div>
                      <div className="p-6">
                        <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                          {video.title}
                        </h4>
                        <p className="text-gray-600 dark:text-gray-400">
                          {video.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* CTA Section */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
              <div className="max-w-3xl mx-auto text-center">
                <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
                  {marketingContent.cta.title}
                </h2>
                <p className="mt-4 text-lg text-blue-100">
                  {marketingContent.cta.description}
                </p>
                <div className="mt-8">
                  <a
                    href={marketingContent.cta.buttonLink}
                    onClick={() => handleEngagement('cta', 'signup', 'click')}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 transition-colors"
                  >
                    {marketingContent.cta.buttonText}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MarketingContent;