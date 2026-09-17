import React from 'react';
import { Phone, MessageCircle } from 'lucide-react';
import { RESTAURANT_CONFIG } from '../data/restaurantData';

export default function FloatingActions() {
  const whatsappNumber = RESTAURANT_CONFIG.whatsappNumber.replace(/[^0-9]/g, '');
  const prefilledMessage = encodeURIComponent(
    'Hello Sri Sai Lakshmi Mess, I would like to enquire about your food/menu and catering.'
  );
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${prefilledMessage}`;
  const phoneTel = `tel:${RESTAURANT_CONFIG.phone.replace(/[^0-9+]/g, '')}`;

}
