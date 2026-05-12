import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaBed, FaBath, FaMapMarkerAlt, FaRulerCombined } from 'react-icons/fa';
import Badge from './Badge';

export default function PropertyCard({ listing, index = 0 }) {
  if (!listing) return null;

  const {
    _id,
    name,
    address,
    city,
    price,
    imageUrls,
    bedrooms,
    bathrooms,
    area,
    type,
    status,
    slug,
  } = listing;

  const image = imageUrls?.[0] || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&auto=format&fit=crop';
  const isAvailable = status === 'متاح' || status === 'available' || !status;
  const href = slug ? `/listings/${slug}` : `/listings/${_id}`;

  const formattedPrice = price
    ? Number(price).toLocaleString('ar-SA') + ' ريال'
    : 'السعر عند الاستفسار';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className="project-card bg-white group cursor-pointer"
    >
      <Link to={href}>
        {/* Image */}
        <div className="relative overflow-hidden h-52">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
          />
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          {/* Badge */}
          <div className="absolute top-3 right-3">
            <Badge type={isAvailable ? 'available' : 'sold'} />
          </div>
          {/* Type */}
          {type && (
            <div className="absolute top-3 left-3">
              <span className="px-2 py-0.5 text-[10px] font-black tracking-widest bg-[#12283C] text-[#DFBA6B]">
                {type}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Price */}
          <div className="text-[#8A6924] font-black text-lg mb-1">{formattedPrice}</div>

          {/* Name */}
          <h3 className="text-[#12283C] font-bold text-base mb-2 line-clamp-1 group-hover:text-[#8A6924] transition-colors">
            {name}
          </h3>

          {/* Location */}
          {(address || city) && (
            <p className="flex items-center gap-1.5 text-[#6b5e3e] text-xs mb-3">
              <FaMapMarkerAlt className="text-[#8A6924] flex-shrink-0" />
              <span className="line-clamp-1">{[address, city].filter(Boolean).join('، ')}</span>
            </p>
          )}

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-[#8A6924]/20 to-transparent mb-3" />

          {/* Details row */}
          <div className="flex items-center gap-4 text-[#6b5e3e] text-xs">
            {bedrooms != null && (
              <span className="flex items-center gap-1">
                <FaBed className="text-[#8A6924]" />
                {bedrooms} غرف
              </span>
            )}
            {bathrooms != null && (
              <span className="flex items-center gap-1">
                <FaBath className="text-[#8A6924]" />
                {bathrooms} حمام
              </span>
            )}
            {area && (
              <span className="flex items-center gap-1">
                <FaRulerCombined className="text-[#8A6924]" />
                {area} م²
              </span>
            )}
          </div>
        </div>

        {/* CTA strip */}
        <div className="mx-4 mb-4">
          <div className="w-full py-2 text-center text-xs font-bold tracking-wider text-[#8A6924] border border-[#8A6924] group-hover:bg-[#8A6924] group-hover:text-white transition-all duration-300">
            عرض التفاصيل
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
