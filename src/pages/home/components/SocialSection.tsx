import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from '../hooks/useInView';

const SocialSection = () => {
  const [lightboxImage, setLightboxImage] = useState<{ url: string; alt: string } | null>(null);

  const socialImages = [
    {
      url: 'https://readdy.ai/api/search-image?query=Diverse%20community%20town%20hall%20meeting%20South%20Fulton%20Georgia%20Senate%20District%2028%20majority%20African%20American%20attendees%20with%20Hispanic%20and%20white%20neighbors%20seated%20together%20engaged%20listening%20to%20candidate%20professional%20warm%20indoor%20lighting%20authentic%20civic%20participation%20community%20center&width=400&height=400&seq=social1d28v2&orientation=squarish',
      alt: 'Community Town Hall — South Fulton',
    },
    {
      url: 'https://readdy.ai/api/search-image?query=African%20American%20and%20Hispanic%20small%20business%20owners%20in%20Douglasville%20Georgia%20shaking%20hands%20with%20Black%20male%20candidate%20diverse%20group%20of%20entrepreneurs%20mixed%20race%20professional%20community%20engagement%20natural%20lighting%20local%20shop%20storefront%20Georgia&width=400&height=400&seq=social2d28v2&orientation=squarish',
      alt: 'Meeting Local Business Owners — Douglasville',
    },
    {
      url: 'https://readdy.ai/api/search-image?query=Diverse%20neighborhood%20canvassing%20South%20Fulton%20Georgia%20Black%20candidate%20talking%20with%20African%20American%20family%20on%20porch%20while%20Hispanic%20neighbor%20waves%20from%20yard%20white%20family%20visible%20in%20background%20suburban%20Georgia%20homes%20afternoon%20sunlight%20authentic%20grassroots%20campaign&width=400&height=400&seq=social3d28v2&orientation=squarish',
      alt: 'Door-to-Door Canvassing — South Fulton',
    },
    {
      url: 'https://static.readdy.ai/image/37f481326fda0879b2d66b8287a2bda5/37c0a00cc24d9a2fa1b686ee6498a312.png',
      alt: 'Campaign Rally — Mableton',
    },
    {
      url: 'https://readdy.ai/api/search-image?query=Diverse%20group%20of%20parents%20and%20teachers%20at%20Douglas%20County%20Georgia%20school%20meeting%20African%20American%20Hispanic%20and%20white%20families%20together%20discussing%20education%20policy%20with%20Black%20male%20candidate%20warm%20classroom%20lighting%20authentic%20community%20moment&width=400&height=400&seq=social5d28v2&orientation=squarish',
      alt: 'Education Forum — Douglas County',
    },
    {
      url: 'https://readdy.ai/api/search-image?query=Multicultural%20senior%20citizens%20group%20in%20Powder%20Springs%20Georgia%20diverse%20African%20American%20Hispanic%20and%20white%20elderly%20residents%20seated%20together%20at%20community%20event%20listening%20to%20Black%20male%20candidate%20property%20tax%20relief%20discussion%20warm%20indoor%20lighting%20authentic%20moment&width=400&height=400&seq=social6d28v2&orientation=squarish',
      alt: 'Senior Community Forum — Powder Springs',
    },
  ];

  const socialLinks = [
    { name: 'Facebook', url: 'https://www.facebook.com/melkeyton' },
    { name: 'Instagram', url: 'https://www.instagram.com/melkeyton' },
    { name: 'Twitter / X', url: 'https://www.twitter.com/melkeyton' },
    { name: 'YouTube', url: 'https://www.youtube.com/@melkeyton' },
  ];

  const { ref, isInView } = useInView({ threshold: 0.2 });

  return (
    <>
      <section ref={ref} className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="w-12 h-12 flex items-center justify-center">
                <i className="ri-share-line text-3xl text-lime"></i>
              </div>
            </div>
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-display text-dark-green mb-6">
              What's Up
              <br />
              <span className="text-lime">On Socials</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-12">
            {socialImages.map((image, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="aspect-square rounded-lg overflow-hidden group cursor-pointer relative"
                onClick={() => setLightboxImage(image)}
              >
                <img
                  src={image.url}
                  alt={image.alt}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
                  <div className="w-10 h-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <i className="ri-zoom-in-line text-white text-2xl"></i>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-center"
          >
            <p className="text-2xl md:text-3xl font-display text-dark-green mb-8">
              Follow Mel on social media
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6">
              {socialLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-lg font-bold text-dark-green hover:text-lime transition-colors cursor-pointer"
                >
                  {link.name}
                </a>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {lightboxImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
            onClick={() => setLightboxImage(null)}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="relative max-w-4xl w-full max-h-[90vh] rounded-xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={lightboxImage.url}
                alt={lightboxImage.alt}
                className="w-full h-full object-contain bg-black"
                style={{ maxHeight: '85vh' }}
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-6 py-4">
                <p className="text-white text-sm font-medium">{lightboxImage.alt}</p>
              </div>
              <button
                onClick={() => setLightboxImage(null)}
                className="absolute top-3 right-3 w-9 h-9 flex items-center justify-center bg-black/50 hover:bg-black/80 rounded-full transition-colors cursor-pointer"
              >
                <i className="ri-close-line text-white text-xl"></i>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default SocialSection;