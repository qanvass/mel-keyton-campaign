import { motion } from 'framer-motion';
import { useState } from 'react';
import { useInView } from '../hooks/useInView';
import { milestones } from '../../../mocks/milestones';

export default function HelmetGallery() {
  const { ref, isInView } = useInView({ threshold: 0.1 });
  const [selectedPolicy, setSelectedPolicy] = useState<typeof milestones[0] | null>(null);

  return (
    <>
      <section id="priorities" ref={ref} className="py-32 bg-black">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="mb-16"
          >
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-display text-white mb-4">
              Policy
              <br />
              <span className="text-lime">Priorities</span>
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl">
              From healthcare access to education reform, Mel Keyton is committed to delivering
              real results for Georgia families and building a stronger District 28.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {milestones.map((milestone, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.05 }}
                className="group cursor-pointer"
                onClick={() => setSelectedPolicy(milestone)}
              >
                <div className="relative bg-dark-green rounded-lg overflow-hidden mb-4 aspect-square border-2 border-gray-800 hover:border-lime transition-colors">
                  <img
                    src={milestone.baseImage}
                    alt={milestone.name}
                    className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-0"
                  />
                  <img
                    src={milestone.hoverImage}
                    alt={milestone.name}
                    className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white">{milestone.name}</h3>
                  <span className="text-sm text-gray-400">{milestone.category}</span>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-16 text-center"
          >
            <a
              href="#on-trail"
              className="inline-flex items-center gap-3 px-8 py-4 bg-lime text-dark-green text-base font-bold rounded-full hover:bg-lime/90 transition-all cursor-pointer whitespace-nowrap"
            >
              View Campaign Trail
              <i className="ri-arrow-right-line"></i>
            </a>
          </motion.div>
        </div>
      </section>

      {/* Policy Modal */}
      {selectedPolicy && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedPolicy(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              <img
                src={selectedPolicy.hoverImage}
                alt={selectedPolicy.name}
                className="w-full h-64 object-cover rounded-t-2xl"
              />
              <button
                onClick={() => setSelectedPolicy(null)}
                className="absolute top-4 right-4 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors cursor-pointer"
              >
                <i className="ri-close-line text-2xl"></i>
              </button>
            </div>

            <div className="p-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-lime/10 text-lime text-sm font-bold rounded-full">
                  {selectedPolicy.category}
                </span>
                <h3 className="text-3xl font-display font-bold text-dark-green">
                  {selectedPolicy.name}
                </h3>
              </div>

              <p className="text-2xl font-bold text-black mb-4">
                {selectedPolicy.description}
              </p>

              <p className="text-lg text-gray-700 leading-relaxed mb-8">
                {selectedPolicy.fullDescription}
              </p>

              <div className="flex gap-4">
                <a
                  href="#donate"
                  className="flex-1 px-6 py-4 bg-lime text-dark-green text-base font-bold rounded-full hover:bg-lime/90 transition-all text-center cursor-pointer whitespace-nowrap"
                >
                  Join the Movement
                </a>
                <button
                  onClick={() => setSelectedPolicy(null)}
                  className="px-6 py-4 bg-gray-200 text-gray-800 text-base font-bold rounded-full hover:bg-gray-300 transition-all cursor-pointer whitespace-nowrap"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}