import React, { useEffect, useState } from 'react'
import { assets } from '../assets/assets'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

const slides = [
  {
    image: assets.hero_img,
    title: 'Discover New Arrivals',
    desc: 'Soft, stylish, and comfortable outfits made with love for your little ones.',
  },
  {
    image: assets.hero_img_1,
    title: 'Trendy Baby Fashion',
    desc: 'Cute collections designed for everyday comfort and style.',
  },
  {
    image: assets.hero_img_2,
    title: 'Premium Quality Wear',
    desc: 'Gentle fabrics that care for your baby’s delicate skin.',
  },
]

const Hero = () => {
  const [index, setIndex] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length)
    }, 4000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative w-full h-[90vh] overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          className="absolute w-full h-full"
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.8 }}
        >
          <img
            src={slides[index].image}
            className="w-full h-full object-cover"
            alt={slides[index].title}
          />

          <div className="absolute inset-0 bg-black/40"></div>

          <div className="absolute inset-0 flex items-center px-6 sm:px-12 lg:px-20">
            <div className="max-w-xl text-white">
              <motion.p
                className="text-sm tracking-widest mb-3"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                OUR BESTSELLERS
              </motion.p>

              <motion.h1
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif mb-5"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
              >
                {slides[index].title}
              </motion.h1>

              <motion.p
                className="text-sm md:text-base text-gray-200 mb-6"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9 }}
              >
                {slides[index].desc}
              </motion.p>

              <motion.button
                onClick={() => navigate('/collection')}
                className="bg-white text-black px-6 py-3 rounded-full font-semibold hover:bg-gray-200 transition"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Shop Now
              </motion.button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="absolute bottom-5 w-full flex justify-center gap-2">
        {slides.map((_, i) => (
          <div
            key={i}
            onClick={() => setIndex(i)}
            className={`w-3 h-3 rounded-full cursor-pointer transition ${
              i === index ? 'bg-white' : 'bg-gray-400'
            }`}
          ></div>
        ))}
      </div>
    </div>
  )
}

export default Hero